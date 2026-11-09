-- FAKE DATA FOR THE AUTOMATED TESTS ONLY (npm run check:schema loads this).
-- Never run this on the real Supabase project: it adds a fake landlord and fake reviews.

-- 10. Seed Initial Data (Landlords and Reviews)
INSERT INTO public.landlords (id, name, addresses, city, status) OVERRIDING SYSTEM VALUE VALUES
  (1, 'fake landlord 1', ARRAY['123 Hemphill Ave NW', '456 State St NW', '789 W Peachtree St NW', '310 Spring St NW', '22 Edgewood Ave SE'], 'Atlanta', 'approved')
ON CONFLICT (id) DO NOTHING;

-- Set sequence value to avoid collision with manual inserts
SELECT setval('landlords_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.landlords), 1), false);

INSERT INTO public.reviews (id, landlord_id, landlord_rating, building_rating, bedrooms, comment, tags, would_rent_again, rent_amount, property_address, verification_status, created_at, updated_at) OVERRIDING SYSTEM VALUE VALUES
  (1, 1, 2, 2, 1, 'Fake review', ARRAY['So Many Bugs', 'Mold'], false, 1200, '123 Hemphill Ave NW', 'unverified', '2023-07-10 12:00:00+00', '2023-07-10 12:00:00+00'),
  (2, 1, 3, 3, 5, 'Fake review', ARRAY['Peeling Paint', 'Pet Friendly'], true, 1350, '123 Hemphill Ave NW', 'verified', '2023-09-22 12:00:00+00', '2023-09-22 12:00:00+00'),
  (3, 1, 1, 1, 0, 'Fake review', ARRAY['Peeling Paint', 'Pet Friendly'], false, NULL, '22 Edgewood Ave SE', 'pending', '2023-06-05 12:00:00+00', '2023-06-05 12:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Set sequence value to avoid collision with manual inserts
SELECT setval('reviews_id_seq', COALESCE((SELECT MAX(id)+1 FROM public.reviews), 1), false);
