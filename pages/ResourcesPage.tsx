import React from 'react';

const ResourcesPage: React.FC = () => {
  const resources = [
    {
      category: "Tenant Rights and Awareness",
      links: [
        { title: "Resources", url: "resource.com", description: "Resource description" },
         { title: "Resources", url: "resource.com", description: "Resource description" },
         { title: "Resources", url: "resource.com", description: "Resource description" },
      ]
    },
    {
      category: "Legal Aid",
      links: [
         { title: "Resources", url: "resource.com", description: "Resource description" },
         { title: "Resources", url: "resource.com", description: "Resource description" },
         { title: "Resources", url: "resource.com", description: "Resource description" },
      ]
    },
    {
      category: "Hotlines",
      links: [
         { title: "Resources", url: "resource.com", description: "Resource description" },
         { title: "Resources", url: "resource.com", description: "Resource description" },
         { title: "Resources", url: "resource.com", description: "Resource description" },

      ]
    }
  ];

  return (
    <div className="resources-page">
      <div className="hero">
        <h1>Renter Resources</h1>
        <p className="hero__subtitle">Helpful information, legal aid, and support for tenants in [insert location here].</p>
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
