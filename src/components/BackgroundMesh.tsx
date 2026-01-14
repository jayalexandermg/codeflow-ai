import { motion } from 'framer-motion';

export function BackgroundMesh() {
    return (
        <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
            <motion.div
                className="absolute w-[800px] h-[800px] -top-[200px] -right-[200px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(249, 115, 22, 0.08) 0%, transparent 70%)',
                }}
                animate={{
                    x: [0, 30, 0],
                    y: [0, 30, 0],
                    rotate: [0, 5, 0],
                }}
                transition={{
                    duration: 20,
                    ease: 'easeInOut',
                    repeat: Infinity,
                }}
            />
            <motion.div
                className="absolute w-[600px] h-[600px] -bottom-[100px] -left-[100px] rounded-full"
                style={{
                    background: 'radial-gradient(circle, rgba(6, 182, 212, 0.06) 0%, transparent 70%)',
                }}
                animate={{
                    x: [0, -30, 0],
                    y: [0, -30, 0],
                    rotate: [0, -5, 0],
                }}
                transition={{
                    duration: 15,
                    ease: 'easeInOut',
                    repeat: Infinity,
                }}
            />
        </div>
    );
}
