// components/GlobalEffects.jsx

import { motion, useScroll, useSpring } from 'framer-motion';

export const GlobalEffects = () => {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30
  });

  return (
    <>
      {/* Barra superior */}
      <motion.div
        className="scroll-progress"
        style={{ scaleX }}
      />

      {/* Fondo glow */}
      <div className="background-glow"></div>
    </>
  );
};