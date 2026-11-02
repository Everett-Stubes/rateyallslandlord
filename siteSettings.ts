/**
 * EDIT YOUR SITE NAME, CITY, SCHOOLS, AND NEIGHBORHOODS HERE.
 *
 * Change only the values inside quotes. Keep the quotes, commas, and brackets.
 * To add a school or neighborhood, copy an existing { ... } block, paste it
 * after the last one in the same list, and edit the copy.
 * Logo wording and colors live separately in logoSettings.ts.
 */
export const siteSettings = {
  siteName: "Rate Y'all's Landlord",
  domain: "rateyallslandlord.com",
  city: "Atlanta",
  state: "GA",
  // Shown as an example inside the address boxes on the forms.
  addressExample: "e.g., 123 10th St NW, Atlanta, GA",
  schools: [
    {
      name: "Georgia Tech",
      // Reviews from these exact email domains are marked as student reviews.
      emailDomains: ["gatech.edu"],
    },
    {
      name: "Georgia State",
      emailDomains: ["gsu.edu", "student.gsu.edu"],
    },
  ],
  // The neighborhood buttons on the homepage, in this order. Clicking one shows landlords with a
  // property on one of its streets (from the landlord's addresses or the addresses in their reviews).
  // Matching is by street name, so it's approximate: a long street can cross several neighborhoods.
  neighborhoods: [
    {
      name: "Home Park",
      streets: ["Hemphill Ave", "State St", "Atlantic Dr", "Lynch Ave", "Francis St", "Holly St", "Mecaslin St", "Ethel St"],
    },
    {
      name: "Midtown",
      streets: ["Peachtree St NE", "W Peachtree St", "Spring St", "Juniper St", "Crescent Ave", "Peachtree Pl", "Techwood Dr", "10th St NE", "14th St NE"],
    },
    {
      name: "Downtown",
      streets: ["Edgewood Ave", "Decatur St", "Auburn Ave", "Courtland St", "Piedmont Ave", "Peachtree Center Ave", "Peachtree St SW", "John Wesley Dobbs Ave", "Ellis St", "Marietta St", "Luckie St", "Forsyth St", "Broad St", "Mitchell St", "Centennial Olympic Park Dr", "Ted Turner Dr"],
    },
    {
      name: "Other",
      // An empty street list means "every landlord not in the neighborhoods above".
      streets: [],
    },
  ],
};
