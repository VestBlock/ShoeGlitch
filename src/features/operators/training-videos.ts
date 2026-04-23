export interface OperatorTrainingVideo {
  slug: string;
  title: string;
  href: string;
  provider: string;
  category: string;
  material: string;
  bestFor: string;
  whyItMatters: string;
  publishedLabel: string;
  featured?: boolean;
}

export const operatorTrainingVideos: OperatorTrainingVideo[] = [
  {
    slug: 'laundry-system',
    title: 'In-depth tutorial of the Sneaker Laundry System',
    href: 'https://reshoevn8r.com/blogs/news/in-depth-tutorial-of-the-reshoevn8r-sneaker-laundry-system',
    provider: 'Reshoevn8r / Shoe Care Academy',
    category: 'Core system',
    material: 'Mesh, canvas, washable uppers',
    bestFor: 'Building the standard deep-clean flow before you touch delicate pairs.',
    whyItMatters:
      'This is the cleanest walkthrough of pre-brush, solution work, bagging, and machine-safe finishing for everyday operator volume.',
    publishedLabel: 'Recent academy tutorial',
    featured: true,
  },
  {
    slug: 'mesh-sneakers',
    title: 'How to clean mesh sneakers with the laundry system',
    href: 'https://reshoevn8r.com/blogs/news/how-to-clean-mesh-sneakers-with-reshoevn8r-laundry-system',
    provider: 'Reshoevn8r / Shoe Care Academy',
    category: 'Material playbook',
    material: 'Mesh runners, knit trainers, white uppers',
    bestFor: 'On Cloud, Flyknit, Vomero, performance runners, and pairs that trap sweat and dust.',
    whyItMatters:
      'Mesh is one of the easiest materials to overwet or muddy. This is the best quick reference for soft-brush first and wash-system finishing.',
    publishedLabel: 'Published 2024',
    featured: true,
  },
  {
    slug: 'suede-all-colors',
    title: 'The best way to clean suede shoes | all colors',
    href: 'https://reshoevn8r.com/blogs/news/how-to-clean-suede',
    provider: 'Reshoevn8r',
    category: 'Material playbook',
    material: 'Suede and nubuck',
    bestFor: 'Pairs that can get watermarked, matted, or darkened if the technique is sloppy.',
    whyItMatters:
      'Suede mistakes are expensive. This is the best baseline for brushing, even saturation, and restoring nap after the clean.',
    publishedLabel: 'Classic reference',
    featured: true,
  },
  {
    slug: 'jordan-4-cleaning',
    title: 'How to clean Jordan 4 “Wet Cement” without ruining the suede',
    href: 'https://reshoevn8r.com/blogs/news/how-to-clean-jordan-4-wet-cement',
    provider: 'Reshoevn8r',
    category: 'Model playbook',
    material: 'Jordan 4 mesh, wings, midsoles, trim',
    bestFor: 'One of the most common silhouettes where customers notice bad cleaning immediately.',
    whyItMatters:
      'Jordan 4s combine mesh, plastic, edge detail, and shape retention. This is the fastest way to align operators on one consistent Jordan 4 standard.',
    publishedLabel: 'Published 2025',
    featured: true,
  },
  {
    slug: 'af1-white-leather',
    title: 'Quickest way to clean all-white Air Force 1s',
    href: 'https://reshoevn8r.com/blogs/news/supreme-air-force-1-cleaning',
    provider: 'Reshoevn8r',
    category: 'Model playbook',
    material: 'White leather and rubber midsoles',
    bestFor: 'High-volume, everyday customer work where speed and consistency matter more than restoration drama.',
    whyItMatters:
      'AF1s are the easiest place to tighten your repeatable process for leather uppers, edge cleanup, and finishing without overcomplicating the job.',
    publishedLabel: 'Classic reference',
  },
  {
    slug: 'icy-soles',
    title: 'The best trick to unyellow icy soles',
    href: 'https://reshoevn8r.com/blogs/news/clean-sole-unyellow-jordan-11-sole',
    provider: 'Reshoevn8r',
    category: 'Restoration skill',
    material: 'Translucent and icy soles',
    bestFor: 'Jordan 11s and any pair where oxidation and sole color drive the whole restoration outcome.',
    whyItMatters:
      'Operators need one solid reference for when a pair has crossed from cleaning into restoration work. This is that line in the sand.',
    publishedLabel: 'Classic reference',
  },
  {
    slug: 'common-mistakes',
    title: '5 common mistakes when cleaning sneakers',
    href: 'https://reshoevn8r.com/blogs/news/5-common-mistakes-when-cleaning-sneakers',
    provider: 'Reshoevn8r',
    category: 'Mistake prevention',
    material: 'All materials',
    bestFor: 'New operators who need to avoid soaking, over-brushing, skipping dry prep, or forcing the wrong brush on the wrong upper.',
    whyItMatters:
      'This is the fastest way to reduce preventable errors across the network before they become customer-facing damage.',
    publishedLabel: 'Published 2024',
  },
];
