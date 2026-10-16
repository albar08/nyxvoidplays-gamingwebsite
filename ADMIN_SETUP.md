# NyxVoid Plays Admin Setup

This project is still a static website, but it is now prepared for a simple admin/content workflow.

## What is included

- `admin.html` — admin login + content manager page
- `admin.js` — Supabase-based admin logic
- `supabase/schema.sql` — starter SQL schema for your site data

## What you need to do

1. Create a Supabase project.
2. In Supabase Storage, create a bucket called `media` and set it to public.
3. Run the SQL from `supabase/schema.sql` in the Supabase SQL editor.
4. In the admin page, save your Supabase URL and anon key.
5. Set up an admin user with Supabase Auth.
6. Log in to `admin.html` and manage your highlights and updates.

## Important

This is a starter structure. It is designed for a static front-end with live data from Supabase.

Your public site can continue to render from a simple fetch layer once the data is connected.

## Next step for the public site

Replace the static `data/content.json` fetch with Supabase queries for:
- `highlights`
- `updates`

Then keep the same page design and rendering logic.

## Example fields

### highlights
- id
- title
- image_url
- link
- sort_order
- is_active
- created_at

### updates
- id
- title
- text
- image_url
- video_url
- type
- is_active
- created_at

## Notes

This system keeps your content editable without manually adding new HTML or JS for each item.
It is the right foundation for your next upgrade.
