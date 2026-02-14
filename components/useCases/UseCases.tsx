"use client";

import { motion } from "framer-motion";

const useCases = [
  {
    title: "Marathons & Walkathons",
    image: "https://images.unsplash.com/photo-1540539234-c14a20fb7c7b",
  },
  {
    title: "Cycling Events",
    image: "https://images.unsplash.com/photo-1508780709619-79562169bc64",
  },
  {
    title: "School & College Sports",
    image: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d",
  },
  {
    title: "Corporate Events",
    image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d",
  },
];

export default function UseCases() {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 mt-20">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center border-title"
        >
          <h2 className="text-3xl md:text-4xl font-semibold text-gray-900 main-title">
            <span>Events We Power</span>
          </h2>
          <p className="mt-3 text-2xl md:text-3xl lg:text-4xl text-gray-600 max-w-2xl mx-auto tan">
            Choose your next experience and register instantly.
          </p>
        </motion.div>

        {/* Supporting Line */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ delay: 0.15, duration: 0.5 }}
          className="max-w-3xl text-gray-600 mb-20"
        >
          Whether you’re organizing a local run or a large-scale program, our
          platform adapts seamlessly to your needs.
        </motion.p>

        {/* 4 Image Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {useCases.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: index * 0.08, duration: 0.55 }}
              className="group relative h-72 overflow-hidden rounded-3xl"
            >
              {/* Image */}
              <img
                src={item.image}
                alt={item.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-black/35 transition group-hover:bg-black/50" />

              {/* Text */}
              <div className="absolute inset-0 flex items-end p-6">
                <h3 className="text-lg font-semibold text-white leading-snug">
                  {item.title}
                </h3>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
