import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { Home, MapOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-lg"
      >
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mb-8"
        >
          <div className="inline-block relative">
            <div className="w-32 h-32 bg-gradient-to-br from-primary to-secondary rounded-3xl flex items-center justify-center shadow-2xl transform -rotate-6">
              <MapOff className="w-20 h-20 text-white" />
            </div>
            <div className="absolute -top-3 -right-3 w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center text-3xl font-bold">
              404
            </div>
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-5xl md:text-6xl font-bold font-script mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
        >
          Lost in Space!
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-xl text-gray-700 mb-3"
        >
          Oops! This location doesn't exist on our map.
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-600 mb-8"
        >
          Looks like you've wandered off the beaten path. Let's get you back to familiar territory!
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link to="/">
            <Button
              size="lg"
              className="rounded-full px-8 text-lg shadow-xl hover:scale-105 transition-transform"
            >
              <Home className="w-5 h-5 mr-2" />
              Return Home
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-sm text-gray-500"
        >
          Error code: 404 • Path: {location.pathname}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default NotFound;
