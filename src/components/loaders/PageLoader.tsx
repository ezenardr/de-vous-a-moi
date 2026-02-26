"use client";
import { AnimatePresence, motion } from "framer-motion";
import LoadingDots from "./LoadingDots";

export default function PageLoader({ isLoading }: { isLoading: boolean }) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed top-0 left-0 w-screen h-dvh bg-primary-100/50 z-9999999 flex items-center justify-center"
          initial={{ opacity: 0 }} // when it first appears
          animate={{ opacity: 1 }} // when visible
          exit={{ opacity: 0 }} // when leaving
          transition={{ duration: 0.3 }} // adjust speed
        >
          <LoadingDots />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
