/**
 * EDIT YOUR SITE NAME, CITY, SCHOOLS, AND NEIGHBORHOODS HERE.
 *
 * Change only the values inside quotes. Keep the quotes, commas, and brackets.
 * To add a school or neighborhood, copy an existing { ... } block, paste it
 * after the last one in the same list, and edit the copy.
 * Logo wording and default colors live separately in logoSettings.ts.
 */
export const siteSettings = {
  siteName: "Rate Y'all's Landlord",
  // Shown next to the big title on the homepage.
  tagline: "For Atlanta College Students",
  domain: "rateyallslandlord.com",
  // Where people email questions and suggestions, such as a neighborhood we're missing.
  contactEmail: "rateyallslandlord@gmail.com",
  city: "Atlanta",
  state: "GA",
  // Shown as an example inside the address boxes on the forms.
  addressExample: "e.g., 123 10th St NW, Atlanta, GA",
  // The schools in the "Where do you go to school?" pop-up, in this order.
  //   id:           A short code saved in the visitor's browser. Don't change it once the site is live.
  //   shortName:    Shown in the header after someone picks the school.
  //   emailDomains: Only emails at these domains (or their subdomains, such as student.gsu.edu)
  //                 can create an account and post. ALSO add the domain to the school_email_domains
  //                 table in Supabase (init.sql seeds it), or the database will refuse their posts.
  //                 `npm run check:schema` fails if the two lists differ.
  //   colors:       background = the school's main color (header, buttons, links),
  //                 text = the lettering on that color, accent = highlights and underlines.
  //                 Colors marked "approximate" came from team-color sites, not the school's own
  //                 brand guide; check them against the school's brand page when you can.
  //   campus:       Latitude and longitude of the campus. Neighborhoods are sorted closest-first.
  schools: [
    {
      id: "gt",
      name: "Georgia Tech",
      shortName: "GT",
      emailDomains: ["gatech.edu"],
      colors: { background: "#003057", text: "#B3A369", accent: "#B3A369" },
      campus: { lat: 33.7756, lng: -84.3963 },
    },
    {
      id: "gsu",
      name: "Georgia State",
      shortName: "GSU",
      emailDomains: ["gsu.edu"],
      colors: { background: "#0039A6", text: "#FFFFFF", accent: "#8FB3F0" },
      campus: { lat: 33.7531, lng: -84.3853 },
    },
    {
      id: "emory",
      name: "Emory University",
      shortName: "Emory",
      emailDomains: ["emory.edu"],
      colors: { background: "#012169", text: "#F2A900", accent: "#F2A900" },
      campus: { lat: 33.7925, lng: -84.3240 },
    },
    {
      id: "morehouse",
      name: "Morehouse College",
      shortName: "Morehouse",
      emailDomains: ["morehouse.edu"],
      // Approximate: maroon is PMS 202 in Morehouse's brand guide.
      colors: { background: "#8B2433", text: "#FFFFFF", accent: "#E3AEB6" },
      campus: { lat: 33.7462, lng: -84.4143 },
    },
    {
      id: "spelman",
      name: "Spelman College",
      shortName: "Spelman",
      emailDomains: ["spelman.edu"],
      // Approximate.
      colors: { background: "#114488", text: "#FFFFFF", accent: "#55BBEE" },
      campus: { lat: 33.7457, lng: -84.4110 },
    },
    {
      id: "cau",
      name: "Clark Atlanta University",
      shortName: "CAU",
      emailDomains: ["cau.edu"],
      // Approximate: red, black, and gray.
      colors: { background: "#C8102E", text: "#FFFFFF", accent: "#BABABC" },
      campus: { lat: 33.7535, lng: -84.4103 },
    },
    {
      id: "msm",
      name: "Morehouse School of Medicine",
      shortName: "MSM",
      emailDomains: ["msm.edu"],
      // Approximate: MSM blue and ivory.
      colors: { background: "#003A70", text: "#F5F0E1", accent: "#D8CFAF" },
      campus: { lat: 33.7451, lng: -84.4167 },
    },
    {
      id: "scad",
      name: "SCAD Atlanta",
      shortName: "SCAD",
      // Students: student.scad.edu (older SCAD material; confirm with a student). Covered by scad.edu.
      emailDomains: ["scad.edu"],
      // Approximate: black with gold.
      colors: { background: "#000000", text: "#FFFFFF", accent: "#F9C80E" },
      campus: { lat: 33.7934, lng: -84.3899 },
    },
    {
      id: "agnesscott",
      name: "Agnes Scott College",
      shortName: "Agnes Scott",
      // One domain for students, faculty, and staff.
      emailDomains: ["agnesscott.edu"],
      // Approximate: Agnes Scott purple and white.
      colors: { background: "#5B2D86", text: "#FFFFFF", accent: "#CDB8E8" },
      campus: { lat: 33.7699, lng: -84.2970 },
    },
    {
      id: "mercer",
      name: "Mercer University",
      shortName: "Mercer",
      // Students use live.mercer.edu and faculty/staff use mercer.edu; both are covered by mercer.edu.
      // The same domains are used by Mercer's other campuses (such as Macon), so they can post too.
      emailDomains: ["mercer.edu"],
      // Approximate: Mercer orange, darkened so white lettering stays readable. Campus: 3001 Mercer University Dr.
      colors: { background: "#B84F00", text: "#FFFFFF", accent: "#FF9A4D" },
      campus: { lat: 33.8860, lng: -84.2680 },
    },
  ],
  // Email addresses under these domains are NOT accepted, even though they sit under a school's domain.
  // They are alumni accounts, which prove graduation and not current enrollment. Keep in step with the
  // blocked rows of school_email_domains in Supabase (npm run check:schema checks that).
  blockedEmailDomains: ["alumni.emory.edu", "alumnae.spelman.edu"],
  // The neighborhood buttons on the homepage. Each neighborhood is listed once, even when students
  // from several schools live there.
  //   schools: ids of the schools whose students commonly live there (see the school list above).
  //            After a visitor picks their school, these show first, closest-to-campus first;
  //            every other neighborhood is behind a "more" button. Without a pick, all show in this order.
  //   center:  the neighborhood's middle (latitude, longitude), used for the distance sorting.
  //   streets: clicking the button shows landlords with a property on one of these streets (from
  //            the landlord's addresses or the addresses in their reviews). Matching looks for the
  //            text anywhere in the address, so it's approximate: a long street can cross several
  //            neighborhoods, and a landlord can show up under more than one.
  neighborhoods: [
    // --- Around Georgia Tech and SCAD ---
    {
      name: "Home Park",
      schools: ["gt"],
      center: { lat: 33.7845, lng: -84.4030 },
      streets: ["Hemphill Ave", "State St", "Atlantic Dr", "Lynch Ave", "Francis St", "Holly St", "Mecaslin St", "Ethel St"],
    },
    {
      name: "Midtown",
      schools: ["gt", "scad"],
      center: { lat: 33.7810, lng: -84.3830 },
      streets: ["Peachtree St NE", "W Peachtree St", "Spring St", "Juniper St", "Crescent Ave", "Peachtree Pl", "Techwood Dr", "10th St NE", "14th St NE"],
    },
    {
      name: "Atlantic Station",
      schools: ["gt", "scad"],
      center: { lat: 33.7920, lng: -84.3970 },
      streets: ["Atlantic Station", "17th St NW", "18th St NW", "19th St NW", "District Ave", "Market St NW", "Bishop St"],
    },
    {
      name: "West Midtown",
      schools: ["gt"],
      center: { lat: 33.7860, lng: -84.4120 },
      streets: ["Howell Mill Rd", "Huff Rd", "Brady Ave", "Ellsworth Industrial Blvd", "Chattahoochee Ave", "Marietta Blvd"],
    },
    {
      name: "Ansley Park",
      schools: ["scad"],
      center: { lat: 33.7940, lng: -84.3780 },
      streets: ["The Prado", "Peachtree Cir", "Westminster Dr", "Lafayette Dr", "Montgomery Ferry Dr", "Inman Cir", "Beverly Rd", "Maddox Dr"],
    },
    // --- Around Georgia State ---
    {
      name: "Downtown",
      schools: ["gsu"],
      center: { lat: 33.7550, lng: -84.3900 },
      streets: ["Edgewood Ave", "Decatur St", "Auburn Ave", "Courtland St", "Piedmont Ave", "Peachtree Center Ave", "Peachtree St SW", "John Wesley Dobbs Ave", "Ellis St", "Marietta St", "Luckie St", "Forsyth St", "Broad St", "Mitchell St", "Centennial Olympic Park Dr", "Ted Turner Dr"],
    },
    {
      name: "Old Fourth Ward",
      schools: ["gsu"],
      center: { lat: 33.7650, lng: -84.3700 },
      streets: ["Boulevard NE", "Highland Ave NE", "Ralph McGill Blvd", "North Ave NE", "Glen Iris Dr", "Freedom Pkwy", "Jackson St NE", "Irwin St", "Angier Ave"],
    },
    {
      name: "Inman Park / Cabbagetown",
      schools: ["gsu"],
      center: { lat: 33.7540, lng: -84.3570 },
      streets: ["Euclid Ave", "Elizabeth St", "Krog St", "Carroll St", "Wylie St", "Hurt St", "Waddell St"],
    },
    {
      name: "Grant Park",
      schools: ["gsu"],
      center: { lat: 33.7370, lng: -84.3700 },
      streets: ["Cherokee Ave", "Boulevard SE", "Park Ave SE", "Grant St SE", "Sydney St", "Augusta Ave", "Atlanta Ave"],
    },
    {
      // Between Downtown and the AUC, so it's near both.
      name: "Castleberry Hill",
      schools: ["gsu", "morehouse", "spelman", "cau", "msm"],
      center: { lat: 33.7480, lng: -84.4000 },
      streets: ["Walker St", "Peters St", "Nelson St", "Haynes St", "Markham St", "Elliott St", "Mangum St"],
    },
    // --- Around the Atlanta University Center (Morehouse, Spelman, Clark Atlanta, MSM) ---
    {
      name: "AUC / Vine City",
      schools: ["morehouse", "spelman", "cau", "msm"],
      center: { lat: 33.7520, lng: -84.4120 },
      streets: ["James P Brawley Dr", "Joseph E Lowery Blvd", "Atlanta Student Movement Blvd", "Fair St", "Chestnut St", "Beckwith St", "Walnut St", "Greensferry Ave", "Parsons St", "Westview Dr"],
    },
    {
      name: "West End",
      schools: ["morehouse", "spelman", "cau", "msm"],
      center: { lat: 33.7360, lng: -84.4130 },
      streets: ["Ralph David Abernathy Blvd", "Lee St", "Oak St", "Lawton St", "Peeples St", "Cascade Ave", "Lucile Ave", "Gordon St"],
    },
    {
      name: "Westview / Ashview Heights",
      schools: ["morehouse", "spelman", "cau", "msm"],
      center: { lat: 33.7460, lng: -84.4260 },
      streets: ["Ashby Grove", "Lawshe St", "Sells Ave", "Westwood Ave", "Langhorn St", "Holderness St"],
    },
    // --- Around Emory ---
    {
      name: "Druid Hills / Emory",
      schools: ["emory"],
      center: { lat: 33.7890, lng: -84.3270 },
      streets: ["Clifton Rd", "N Decatur Rd", "Oxford Rd", "Briarcliff Rd", "Clairmont Rd", "Lullwater Rd", "Haygood Dr", "Durand Dr"],
    },
    {
      name: "Virginia-Highland / Morningside",
      schools: ["emory"],
      center: { lat: 33.7810, lng: -84.3530 },
      streets: ["N Highland Ave", "Virginia Ave", "Rosedale Rd", "St Charles Ave", "Amsterdam Ave", "Morningside Dr", "Monroe Dr"],
    },
    {
      // Its own city just east of Atlanta, and where Agnes Scott is. ", Decatur" matches any address
      // written "..., Decatur, GA"; a ZIP code such as "30030" also works.
      name: "Decatur",
      schools: ["emory", "agnesscott"],
      center: { lat: 33.7748, lng: -84.2963 },
      streets: [", Decatur", "30030", "W Ponce de Leon Ave", "E Ponce de Leon Ave", "Commerce Dr", "Clairemont Ave", "E College Ave", "W College Ave", "Candler St", "McDonough St", "Sycamore St", "E Trinity Pl", "W Trinity Pl"],
    },
    // --- Around Mercer's Atlanta campus ---
    {
      // Mercer's campus (3001 Mercer University Dr, ZIP 30341) is near Chamblee and Doraville. The address
      // box sometimes writes these addresses as "Atlanta", so ZIP codes are listed too.
      name: "Chamblee & Doraville",
      schools: ["mercer"],
      center: { lat: 33.8860, lng: -84.2680 },
      streets: [", Chamblee", ", Doraville", "30340", "30341", "Mercer University Dr", "University Cir", "Flowers Rd", "Peachtree Industrial Blvd"],
    },
    {
      name: "Other",
      // An empty street list means "every landlord not in the neighborhoods above". Always shown last.
      schools: [],
      streets: [],
    },
  ],
};
