# WordPress Implementation & Migration Guide
### Brooksville Moose Lodge Lodge #1676 — CMS Migration Blueprint

For long-term production, WordPress is an excellent choice for a civic fraternal lodge. It provides non-technical lodge staff with an easy administrative login, robust security patches, and vast hosting options. 

This guide outlines exactly how to mirror our full-stack application's structure onto WordPress, using custom post types, metadata fields, secure restricted content, and modern calendars.

---

## ── TABLE OF CONTENTS ──
1. Recommended Plugins & Prerequisites
2. Step 1: Registering Custom Post Types (Events, Gallery, Rentals)
3. Step 2: Advanced Custom Fields (ACF) Database Configuration
4. Step 3: Integrating a User-Friendly Events Calendar
5. Step 4: Restricting "Members-Only" Content
6. Step 5: custom Form integrations (Inquiries & Membership)
7. Step 6: PHP Query Snippets for Custom Themes

---

## 1. RECOMMENDED PLUGINS & PREREQUISITES
To implement this CMS design without writing all PHP plugins from scratch, install the following standard plugins:

*   **Advanced Custom Fields (ACF)** (Free/Pro): Core database custom field storage.
*   **Custom Post Type UI (CPT UI)**: For registering custom data structures in the WP Dashboard (or use our direct PHP registration below).
*   **The Events Calendar** (by StellarWP): The Gold Standard for a responsive, interactive, user-friendly events calendar widget.
*   **User Role Editor**: Allows creating a dedicated "Lodge Administrator" or "WOTM Officer" role with restricted capabilities.
*   **WPForms** or **Gravity Forms**: For the digital Membership Application and Hall Rental Inquiry form.

---

## 2. REGISTERING CUSTOM POST TYPES & TAXONOMIES
Add the following direct PHP code block to your active theme's `functions.php` file to automatically register custom sections:

```php
<?php
// Register Custom Post Types for Brooksville Moose Lodge #1676

function lodge_register_custom_post_types() {

    // 1. Gallery Custom Post Type
    $gallery_labels = array(
        'name'               => 'Lodge Gallery',
        'singular_name'      => 'Gallery Photo',
        'add_new_item'       => 'Add New Photo',
        'edit_item'          => 'Edit Photo',
        'all_items'          => 'All Photos',
        'menu_name'          => 'Lodge Gallery',
    );
    $gallery_args = array(
        'labels'             => $gallery_labels,
        'public'             => true,
        'has_archive'        => true,
        'menu_icon'          => 'dashicons-format-image',
        'supports'           => array('title', 'thumbnail'),
        'rewrite'            => array('slug' => 'lodge-gallery'),
    );
    register_post_type('lodge_gallery', $gallery_args);

    // 2. Hall Rental Inquiries Tracking (Private Post Type acting as CRM)
    $rental_labels = array(
        'name'               => 'Hall Rentals',
        'singular_name'      => 'Rental Inquiry',
        'all_items'          => 'All Inquiries',
        'menu_name'          => 'Hall Rentals',
    );
    $rental_args = array(
        'labels'             => $rental_labels,
        'public'             => false, // Keep hidden of the public front-end
        'show_ui'            => true,  // Show in WordPress Admin Sidebar for management
        'menu_icon'          => 'dashicons-store',
        'supports'           => array('title', 'editor'),
    );
    register_post_type('hall_rental', $rental_args);

    // 3. Register Category Taxonomy for Gallery
    register_taxonomy(
        'gallery_cat',
        'lodge_gallery',
        array(
            'label'        => 'Photo Category',
            'rewrite'      => array('slug' => 'gallery-category'),
            'hierarchical' => true,
        )
    );
}
add_action('init', 'lodge_register_custom_post_types');
```

---

## 3. ADVANCED CUSTOM FIELDS (ACF) DATABASE MAP

To duplicate the fields designed in our Node backend, set up these custom variables in the **ACF Setup Screen**:

### A. General Lodge Settings (Options Page / Widget Settings)
Create an ACF Option field group assigned to "Options Page" or "Sidebar Widget" to edit these global elements:
*   `lodge_phone` (Type: Text) – Default: `(352) 796-0550`
*   `lodge_email` (Type: Email) – Default: `info@brooksvillemoose1676.org`
*   `lodge_address` (Type: Text) – Default: `17129 Cortez Blvd, Brooksville, FL 34601`
*   `alert_banner_text` (Type: Textarea) - To post urgent notices (e.g. Queen of Hearts jackpot size)
*   `bar_hours_mon_thu` (Type: Text) -> `12:00 PM - 10:00 PM`
*   `bar_hours_friday` (Type: Text) -> `11:00 AM - Midnight`

### B. Hall Rental Submissions (Custom Fields on `hall_rental` Post Type)
*   `renter_email` (Type: Email)
*   `renter_phone` (Type: Text)
*   `event_date` (Type: Date Picker)
*   `guests_count` (Type: Number)
*   `wants_kitchen` (Type: True/False)
*   `wants_bar` (Type: True/False)
*   `estimated_price` (Type: Number)
*   `booking_status` (Type: Select: `Pending`, `Contacted`, `Booked`, `Declined`)

---

## 4. CALENDAR INTEGRATION
The most secure, user-friendly implementation of the Events Calendar in WordPress uses the **The Events Calendar** plugin:

1. **Install and Activate** *The Events Calendar*.
2. It automatically creates a new Post Type called `tribe_events`.
3. To mimic our **Lodge Categories** (Public, Members-Only, Fundraiser), navigate to **Events > Event Categories** in WordPress and add:
   *   `Public Events` (Orange label)
   *   `Members Only` (Blue label - e.g. Lodge executive board meetings)
   *   `Fundraisers` (Red label - Charity dinner/BBQ)
4. Use the premium or free shortcode `[tribe_events]` on your `/calendar` page to display an interactive, grid-based, responsive calendar with month-to-month AJAX queries.

---

## 5. MEMBERS-ONLY AREA & CONTENT RESTRICTION
To protect meeting minutes, bylaws, or special membership newsletters:

1. Create a WordPress user role named `Moose Member` using the **User Role Editor** plugin, and disable admin dashboard access but allow reading private posts.
2. In your WordPress Theme, wrap restricted templates or links inside this conditional PHP check:
   ```php
   <?php if ( is_user_logged_in() && current_user_can('read_private_posts') ) : ?>
       <!-- Show private calendar link, bylaws, meeting minutes, and Queen of Hearts results -->
       <a href="<?php echo esc_url( home_url('/bylaws') ); ?>">Download Lodge Bylaws (PDF)</a>
   <?php else : ?>
       <div class="restriction-alert">
           🔒 <strong>Members-Only Area:</strong> Please <a href="<?php echo wp_login_url(); ?>">login with your Moose credentials</a> to access meeting minutes and documents.
       </div>
   <?php endif; ?>
   ```

---

## 6. FORM INTEGRATIONS & CRM PIPELINE
To connect the front-end forms with back-end trackers:

1. In **WPForms**, compile a new form targeting "Hall Rental Inquiries".
2. Add fields for: Full Name, Email, Phone, Event Date, Guest Count, Checkboxes for Kitchen/Bar, and Message details.
3. In the Settings tab, configure a **Confirmation Email Notification** targeting the Hall Chair: `rentals@brooksvillemoose1676.org`.
4. Run a WordPress action hook to store the form submissions on our backend as custom `hall_rental` post items inside WordPress database:
   ```php
   // Integrate form database save
   add_action('wpforms_process_complete', 'save_rental_form_to_database', 10, 4);
   function save_rental_form_to_database($fields, $entry, $form_data, $entry_id) {
       if ($form_data['id'] != 12) return; // Replace with your Form ID
       
       $inquiry_id = wp_insert_post(array(
           'post_title'   => sanitize_text_field($fields[1]['value']) . ' - ' . date('Y-m-d'),
           'post_status'  => 'publish',
           'post_type'    => 'hall_rental',
       ));
       
       update_post_meta($inquiry_id, 'renter_email', sanitize_email($fields[2]['value']));
       update_post_meta($inquiry_id, 'renter_phone', sanitize_text_field($fields[3]['value']));
       update_post_meta($inquiry_id, 'guests_count', intval($fields[4]['value']));
   }
   ```

---

## 7. PHP THEME LAYOUT SNIPPETS (QUERY LOOPS)

### Displaying Current News Posts Feed on Homepage:
```php
<?php
$news_query = new WP_Query(array(
    'post_type'      => 'post', // Standard WordPress News/Posts
    'posts_per_page' => 4,
    'orderby'        => 'date',
    'order'          => 'DESC'
));

if ( $news_query->have_posts() ) : ?>
    <div class="news-grid">
        <?php while ( $news_query->have_posts() ) : $news_query->the_post(); ?>
            <div class="news-card">
                <div class="news-body">
                    <span class="news-cat"><?php get_the_category(); ?></span>
                    <h4><?php the_title(); ?></h4>
                    <p><?php echo wp_trim_words( get_the_excerpt(), 18 ); ?></p>
                    <a href="<?php the_permalink(); ?>">Read Article →</a>
                </div>
            </div>
        <?php endwhile; wp_reset_postdata(); ?>
    </div>
<?php endif; ?>
```

This guide ensures smooth operational hand-off from our modern full-stack progressive web build to a traditional live WordPress site!
