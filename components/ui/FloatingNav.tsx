"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft } from "lucide-react";
import { cRoles } from "@/roles/roles.types";
import type { CRole } from "@/roles/chat.types";

interface FloatingNavProps {
  handleRoleChange: (role: CRole) => void;
  activeRoleName?: string | null;
}

export const FloatingNav: React.FC<FloatingNavProps> = ({
  handleRoleChange,
  activeRoleName: _activeRoleName = null,
}) => {
  const [open, setOpen] = useState(false);
  const floatingRoles = ["CEO", "CTO", "CMO", "CFO"];
  const navRoles = cRoles.filter((role) => floatingRoles.includes(role.name));

  const containerRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="fixed right-4 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center gap-2">
      {/* Chevron button - show only when closed */}
      {!open && (
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen(true)}
          className="w-10 h-10 bg-#8F95A6 shadow-md rounded-full flex items-center justify-center hover:shadow-lg">
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </motion.button>
      )}

      {/* Role icons sliding in (vertical stack) */}
      <AnimatePresence>
        {open &&
          navRoles.map((role, index) => (
            <motion.button
              key={role.id}
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ delay: index * 0.05, duration: 0.25 }}
              onClick={() => {
                handleRoleChange(role);
                setOpen(false);
              }}
              className={`w-12 h-12 rounded-lg flex items-center justify-center text-white text-sm shadow-md ${role.color}`}>
              {role.icon}
            </motion.button>
          ))}
      </AnimatePresence>
    </div>
  );
};
