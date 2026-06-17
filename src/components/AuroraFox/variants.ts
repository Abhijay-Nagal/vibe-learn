export const headVariants = {
  idle: {
    y: [0, -3, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
    },
  },

  thinking: {
    rotate: 8,
    transition: {
      duration: 0.4,
    },
  },

  success: {
    y: [0, -15, 0],
    transition: {
      type: "spring",
      stiffness: 250,
      damping: 12,
    },
  },

  empathetic: {
    rotate: -5,
    transition: {
      duration: 0.5,
    },
  },
};

export const tailVariants = {
  idle: {
    rotate: [-6, 6, -6],
    transition: {
      duration: 3,
      repeat: Infinity,
    },
  },

  thinking: {
    rotate: 0,
  },

  success: {
    rotate: [0, 10, 0],
    transition: {
      duration: 0.4,
    },
  },

  empathetic: {
    rotate: [-2, 2, -2],
    transition: {
      duration: 4,
      repeat: Infinity,
    },
  },
};