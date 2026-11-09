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
    {
      name: "Agnes Scott",
      // One domain for students, faculty, and staff.
      emailDomains: ["agnesscott.edu"],
    },
    {
      name: "Mercer",
      // live.mercer.edu is students; mercer.edu is faculty and staff. Both are shared with Mercer's Macon campus.
      emailDomains: ["live.mercer.edu", "mercer.edu"],
    },
  ],
  // The neighborhood buttons on the homepage, in this order. Clicking one shows landlords with a
  // property on one of its streets (from the landlord's addresses or the addresses in their reviews).
  // Matching is by text, so it's approximate: a long street can cross several neighborhoods. An entry can also
  // be a city or ZIP code: ", Decatur," matches any address in the city of Decatur, and "30341" matches that ZIP.
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
      // Agnes Scott College is just south of downtown Decatur.
      name: "Decatur",
      streets: [", Decatur,", "30030", "E College Ave", "W College Ave", "Candler St", "Clairemont Ave", "McDonough St", "Commerce Dr", "Sycamore St", "E Trinity Pl", "W Trinity Pl"],
    },
    {
      // Mercer's Atlanta campus (3001 Mercer University Dr) is in the 30341 ZIP, near Chamblee and Doraville.
      name: "Chamblee & Doraville",
      streets: [", Chamblee,", ", Doraville,", "30340", "30341", "Mercer University Dr", "University Cir", "Flowers Rd", "Peachtree Industrial Blvd"],
    },
    {
      name: "Other",
      // An empty street list means "every landlord not in the neighborhoods above".
      streets: [],
    },
  ],
};
