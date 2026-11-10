import React from 'react';
import { Link } from 'react-router-dom';
import { siteSettings } from '../siteSettings';

// Adapted from the FAQ in More Perfect University's Rate Your Landlord Playbook.
const FaqPage: React.FC = () => {
  const { siteName, city } = siteSettings;
  const names = siteSettings.schools.map(s => s.name);
  const schoolNames = names.length > 1 ? `${names.slice(0, -1).join(', ')}, and ${names[names.length - 1]}` : names.join('');
  const studentDomains = siteSettings.schools.flatMap(s => s.emailDomains).map(d => `@${d}`).join(', ');

  const faqs: { q: string; a: React.ReactNode }[] = [
    {
      q: `What is ${siteName}?`,
      a: <>A website where {city} renters review their landlords and read what other tenants have said. It's run by students, for students at {schoolNames}.</>,
    },
    {
      q: 'Why does this exist?',
      a: (
        <>
          Most renters, especially students signing a lease for the first time, go in blind: no idea what to expect or
          who to avoid. When a landlord ignores repairs or keeps a deposit, that story usually stays in a group chat.
          This site puts that information in one place, before you sign, and gives tenants a way to tell their stories.
          Landlords who treat tenants well get recognized for it too.
        </>
      ),
    },
    {
      q: 'How does it work?',
      a: (
        <>
          It's Rate My Professor, for landlords. Just as you'd look up a professor before signing up for a class, look up
          a landlord before signing a lease. Search by landlord name, address, or anything mentioned in a review, then
          read their letter grade and what tenants wrote. If a landlord isn't listed yet, you can add them.
        </>
      ),
    },
    {
      q: 'How many reviews can I post?',
      a: (
        <>
          You can post one review per semester (spring, summer, and fall). That keeps any one person from swinging a
          landlord's grade. If something changes, edit your review any time with the Edit button on it, and when a new
          semester starts you can post a fresh one.
        </>
      ),
    },
    {
      q: 'What do the up and down arrows on reviews do?',
      a: (
        <>
          Signed-in students can mark a review as helpful (up) or not (down). Votes only show how others felt about a
          review; they never change a landlord's grade. You can't vote on your own review, and nobody can see who voted.
        </>
      ),
    },
    {
      q: 'Who can leave a review?',
      a: (
        <>
          Any student who has rented from the landlord. Reading is open to everyone, but to post a review or add a
          landlord you need a free account made with your school email ({studentDomains}); we send a link to confirm it's
          yours. Reviews are marked "Verified Student." Your name and email are never shown with your review.
        </>
      ),
    },
    {
      q: 'Are reviews really from students? Are they anonymous?',
      a: (
        <>
          Yes to both. Every review comes from someone who confirmed a school email address before posting, so you know it
          wasn't written by a landlord, a bot, or a stranger. Reviews are anonymous: we never show names or email
          addresses, only the building, the date, which school the reviewer goes to, and what they wrote. We also remove unit numbers, so a landlord
          can't tell which tenant wrote a review. Please don't include your name or unit in the review itself.
        </>
      ),
    },
    {
      q: 'What gets removed?',
      a: (
        <>
          Moderators remove spam, hate speech, threats, and personal information such as phone numbers or a person's home
          address. Write about your experience as a tenant: repairs, communication, deposits, rent, and living conditions.
          See the <Link to="/terms-and-conditions">Terms &amp; Conditions</Link> for the full rules.
        </>
      ),
    },
    {
      q: 'Is this affiliated with More Perfect University?',
      a: (
        <>
          Yes. {siteName} is a More Perfect University Partner. More Perfect University, the campus program of More
          Perfect Union, provides the open-source software, templates, and guidance. This {city} site is run by
          students here.
        </>
      ),
    },
    {
      q: 'Does this fix the housing crisis?',
      a: (
        <>
          No. It's one tool among many for renters and housing organizers. If you're dealing with a problem right now,
          the <Link to="/resources">Renter Resources</Link> page lists free legal help and where to report unsafe conditions.
        </>
      ),
    },
    {
      q: 'Any advice for finding a place?',
      a: (
        <>
          Look up the landlord here before you tour. Read the whole lease before signing and ask questions about anything
          unclear. When you move in, photograph every room and note existing damage in writing, so you have a record when
          it's time to get your deposit back.
        </>
      ),
    },
  ];

  return (
    <div className="faq-page">
      <div className="hero">
        <h1>Frequently Asked Questions</h1>
        <p className="hero__subtitle">Everything you need to know about {siteName}</p>
      </div>

      <div className="faq-list">
        {faqs.map(({ q, a }, i) => (
          <details key={q} className="faq-item" open={i === 0}>
            <summary className="faq-item__q">{q}</summary>
            <div className="faq-item__a">{a}</div>
          </details>
        ))}
      </div>
    </div>
  );
};

export default FaqPage;
