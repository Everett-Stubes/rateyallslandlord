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
  city: "Atlanta",
  state: "GA",
  // Shown as an example inside the address boxes on the forms.
  addressExample: "e.g., 123 10th St NW, Atlanta, GA",
  // The schools in the "Where do you go to school?" pop-up, in this order.
  //   id:           A short code saved in the visitor's browser. Don't change it once the site is live.
  //   shortName:    Shown in the header after someone picks the school.
  //   emailDomains: Only emails at these domains (or their subdomains, such as student.gsu.edu)
  //                 can create an account and post. ALSO update the same list in init.sql
  //                 (the is_school_email function), or the database will refuse their posts.
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
      name: "Emory",
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
      emailDomains: ["scad.edu"],
      // Approximate: black with gold.
      colors: { background: "#000000", text: "#FFFFFF", accent: "#F9C80E" },
      campus: { lat: 33.7934, lng: -84.3899 },
    },
  ],
  // The neighborhood buttons on the homepage. Clicking one shows landlords with a property on one
  // of its streets (from the landlord's addresses or the addresses in their reviews). Matching is by
  // street name, so it's approximate: a long street can cross several neighborhoods.
  // `center` is the neighborhood's middle (latitude, longitude). After a visitor picks their school,
  // the buttons are sorted closest-to-campus first. Without a pick, they stay in this order.
  neighborhoods: [
    {
      name: "Home Park",
      center: { lat: 33.7845, lng: -84.4030 },
      streets: ["Hemphill Ave", "State St", "Atlantic Dr", "Lynch Ave", "Francis St", "Holly St", "Mecaslin St", "Ethel St"],
    },
    {
      name: "Midtown",
      center: { lat: 33.7810, lng: -84.3830 },
      streets: ["Peachtree St NE", "W Peachtree St", "Spring St", "Juniper St", "Crescent Ave", "Peachtree Pl", "Techwood Dr", "10th St NE", "14th St NE"],
    },
    {
      name: "Downtown",
      center: { lat: 33.7550, lng: -84.3900 },
      streets: ["Edgewood Ave", "Decatur St", "Auburn Ave", "Courtland St", "Piedmont Ave", "Peachtree Center Ave", "Peachtree St SW", "John Wesley Dobbs Ave", "Ellis St", "Marietta St", "Luckie St", "Forsyth St", "Broad St", "Mitchell St", "Centennial Olympic Park Dr", "Ted Turner Dr"],
    },
    {
      name: "AUC / Vine City",
      center: { lat: 33.7520, lng: -84.4120 },
      streets: ["James P Brawley Dr", "Joseph E Lowery Blvd", "Atlanta Student Movement Blvd", "Fair St", "Chestnut St", "Beckwith St", "Walnut St", "Greensferry Ave", "Parsons St", "Westview Dr", "Northside Dr"],
    },
    {
      name: "West End",
      center: { lat: 33.7360, lng: -84.4130 },
      streets: ["Ralph David Abernathy Blvd", "Lee St", "Oak St", "Lawton St", "Peeples St", "Cascade Ave", "Lucile Ave", "Gordon St"],
    },
    {
      name: "Druid Hills / Emory",
      center: { lat: 33.7890, lng: -84.3270 },
      streets: ["Clifton Rd", "N Decatur Rd", "Oxford Rd", "Briarcliff Rd", "Clairmont Rd", "Lullwater Rd", "Haygood Dr", "Durand Dr"],
    },
    {
      name: "Other",
      // An empty street list means "every landlord not in the neighborhoods above". Always shown last.
      streets: [],
    },
  ],
};
