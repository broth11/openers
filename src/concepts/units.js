// Unit and lesson names for the concept-visual menus (src/concepts/main.js), by course.
// A unit appears in the menu once it has at least one concept module. Lesson names follow the unit plan.
export const CONCEPT_COURSES = [
  {
    id: 'mai-hl', name: 'IB MAI HL', accent: '#1572b8',
    units: {
      12: {
        name: 'Kinematics',
        // 7 lessons (Ben, 8 November 2026): speed folded into Lesson 3, later lessons renumbered.
        lessons: {
          1: 'The language of motion',
          2: 'Displacement and distance from velocity',
          3: 'From acceleration back to position, and speed',
          4: 'Harder straight-line models',
          5: 'Motion in the plane',
          6: 'Circular and elliptical motion, two particles',
          7: 'Projectile motion',
        },
      },
    },
  },
]
