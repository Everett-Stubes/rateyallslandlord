import React from 'react';
import { siteSettings } from '../siteSettings';

// Links checked November 2026. Recheck them each semester; programs and eligibility change.
const ResourcesPage: React.FC = () => {
  const resources = [
    {
      category: "Know Your Rights",
      links: [
        {
          title: "Georgia Landlord-Tenant Handbook",
          url: "https://dca.georgia.gov/housing-choice-voucher/landlords/georgia-landlord-tenant-handbook",
          description: "The state's plain-language guide to Georgia rental law: leases, deposits, repairs, and evictions. Maintained by the Department of Community Affairs with Georgia State and UGA.",
        },
      ]
    },
    {
      category: "Free Legal Help",
      links: [
        {
          title: "Atlanta Volunteer Lawyers Foundation: Landlord/Tenant Problems",
          url: "https://avlf.org/get-help/landlord-tenant-problems/",
          description: "Free legal help with poor living conditions, security deposits that weren't returned, and illegal evictions.",
        },
        {
          title: "Atlanta Volunteer Lawyers Foundation: Evictions",
          url: "https://avlf.org/get-help/evictions/",
          description: "Help if you've received an eviction notice in Fulton County.",
        },
        {
          title: "Atlanta Legal Aid Society",
          url: "https://atlantalegalaid.org/get-help/",
          description: "Free civil legal services for people who can't afford a lawyer in Fulton, DeKalb, Cobb, Clayton, and Gwinnett counties. Fulton office: 404-524-5811.",
        },
        {
          title: "Georgia Tech SGA Legal Advising",
          url: "https://www.sga.gatech.edu/legal-advising-scheduler",
          description: "Georgia Tech students can schedule legal advising through the Student Government Association.",
        },
      ]
    },
    {
      category: "Report a Problem",
      links: [
        {
          title: "ATL311: Housing Code Violations",
          url: "https://www.atl311.com",
          description: "Report unsafe or unrepaired conditions in the City of Atlanta to Code Enforcement. Call 311 or search \"Code Enforcement\" on ATL311.",
        },
      ]
    }
  ];

  return (
    <div className="resources-page">
      <div className="hero">
        <h1>Renter Resources</h1>
        <p className="hero__subtitle">Know your rights, find free legal help, and report problems in {siteSettings.city}.</p>
      </div>
      <div className="resources-content">
        <div className="resources-categories">
          {resources.map((section, index) => (
            <div key={index} className="resources-category">
              <div className="resources-category__header">
                <h2 className="resources-category__title">{section.category}</h2>
              </div>
              <div>
                {section.links.map((link, linkIndex) => (
                  <a key={linkIndex} href={link.url} target="_blank" rel="noopener noreferrer" className="resources-link">
                    <div className="resources-link__inner">
                      <div>
                        <h3 className="resources-link__title">{link.title}</h3>
                        <p className="resources-link__desc">{link.description}</p>
                      </div>
                      <svg xmlns="http://www.w3.org/2000/svg" className="resources-link__icon" style={{ width: '1.25rem', height: '1.25rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>
  
        <div className="resources-disclaimer">
          <div className="resources-disclaimer__icon">
            <svg xmlns="http://www.w3.org/2000/svg" style={{ width: '1.5rem', height: '1.5rem' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="resources-disclaimer__title">Disclaimer</h4>
            <p className="resources-disclaimer__text">
              The information provided on this page is for educational purposes only and does not constitute legal advice.
              Please consult with a qualified attorney or legal aid organization for advice regarding your specific situation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;
