export type Subject = 'Physics' | 'Chemistry' | 'Mathematics';
export type Status = 'Not Started' | 'Learning' | 'Completed' | 'Needs Revision' | 'Mastered';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export type Chapter = { id: string; subject: Subject; section: string; title: string };

const chemistry = {
  Physical: ['Mole Concept','Atomic Structure','Redox Reactions','Gaseous State','Thermodynamics','Chemical Equilibrium','Ionic Equilibrium','Chemical Kinetics','Electrochemistry','Liquid Solutions','Solid State','Surface Chemistry'],
  Inorganic: ['Periodic Table','Chemical Bonding','Hydrogen','s-Block Elements','p-Block Elements','Boron Family (Group 13)','Carbon Family (Group 14)','Nitrogen Family (Group 15)','Oxygen Family (Group 16)','Halogens (Group 17)','Noble Gases (Group 18)','d & f Block Elements','Environmental Chemistry','Coordination Compounds','Qualitative Analysis','Metallurgy'],
  Organic: ['IUPAC Nomenclature','Isomerism','General Organic Chemistry','Practical Organic Chemistry','Reaction Mechanism','Organometallic Compounds','Hydrocarbons','Aromatic Hydrocarbons','Chemistry in Everyday Life','Biomolecules','Polymers','Alkyl & Aryl Halides','Oxidation & Reduction','Alcohol, Phenol & Ethers','Aldehydes & Ketones','Carboxylic Acid & Derivatives','Amines & Nitrogen Compounds']
};
const physics = {
  'Mechanics, Waves & Oscillation': ['Kinematics',"Newton's Laws of Motion",'Circular Motion','Work, Power & Energy','Center of Mass & Collisions','Rotational Dynamics','Gravitation','Fluid Mechanics','Mechanical Properties of Matter','Simple Harmonic Motion','Waves','Units, Dimensions & Errors Measurement'],
  'Thermal Physics': ['Thermal Expansion & Calorimetry','Heat Transfer','Kinetic Theory of Gases','Thermodynamics'],
  Electromagnetism: ['Electrostatics','Current Electricity','Capacitors','Magnetic Field & Force','Electromagnetic Induction','Alternating Current','Electromagnetic Waves'],
  Optics: ['Wave Optics','Geometrical Optics'],
  'Modern Physics': ['Modern Physics']
};
const mathematics = {
  Algebra: ['Sequence and Series','Quadratic Equation','Determinants','Matrices','Permutation and Combination','Binomial Theorem','Probability','Complex Numbers','Statistics'],
  Trigonometry: ['Trigonometric Ratios & Identities','Trigonometric Equations','Inverse Trigonometric Functions'],
  Calculus: ['Functions','Limits, Continuity & Differentiability','Method Of Differentiation','Application of Derivatives','Indefinite Integration','Definite Integration','Area Under Curves','Differential Equations'],
  'Coordinate Geometry': ['Straight Lines','Circles','Parabola','Ellipse','Hyperbola'],
  'Vector & 3D Geometry': ['Vectors','Three-Dimensional Geometry']
};

const make = (subject: Subject, sections: Record<string, string[]>): Chapter[] => Object.entries(sections).flatMap(([section, titles]) => titles.map(title => ({
  id: `${subject.slice(0, 3).toLowerCase()}-${section}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''), subject, section, title
})));
export const syllabus: Chapter[] = [...make('Physics', physics), ...make('Chemistry', chemistry), ...make('Mathematics', mathematics)];
export const subjectColor: Record<Subject, string> = { Physics: '#6aa9ff', Chemistry: '#b391ff', Mathematics: '#f7b45a' };
