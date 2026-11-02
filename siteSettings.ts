/**
 * EDIT YOUR SITE NAME, CITY, SCHOOLS, AND FOCUS AREAS HERE.
 *
 * Change only the values inside quotes. Keep the quotes, commas, and brackets.
 * To add a school or focus area, copy an existing { ... } block, paste it
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
      focusAreas: [
        {
          name: "Home Park",
          // Clicking this area on the homepage shows landlords with a property on one of these
          // streets (from the landlord's addresses or from the addresses in their reviews).
          streets: ["Hemphill Ave", "State St", "Atlantic Dr", "Lynch Ave", "Francis St", "Holly St", "Mecaslin St", "Ethel St"],
        },
        {
          name: "Midtown",
          streets: ["Peachtree St", "W Peachtree St", "Spring St", "Juniper St", "Crescent Ave", "Peachtree Pl", "Techwood Dr", "10th St NE", "14th St NE", "Piedmont Ave NE"],
        },
        {
          name: "Other",
          // An empty street list means "every landlord not in this school's other areas".
          streets: [],
        },
      ],
    },
    {
      name: "Georgia State",
      emailDomains: ["gsu.edu", "student.gsu.edu"],
      focusAreas: [],
    },
  ],
};
