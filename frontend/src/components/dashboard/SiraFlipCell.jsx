import { motion } from 'motion/react';

const FLIP_TRANSITION = { type: 'spring', stiffness: 280, damping: 20 };

function HistoryIcon() {
    return (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                d="M21 10H3M16 2V6M8 2V6M9 16L11 18L15.5 13.5M7.8 22H16.2C17.8802 22 18.7202 22 19.362 21.673C19.9265 21.3854 20.3854 20.9265 20.673 20.362C21 19.7202 21 18.8802 21 17.2V8.8C21 7.11984 21 6.27976 20.673 5.63803C20.3854 5.07354 19.9265 4.6146 19.362 4.32698C18.7202 4 17.8802 4 16.2 4H7.8C6.11984 4 5.27976 4 4.63803 4.32698C4.07354 4.6146 3.6146 5.07354 3.32698 5.63803C3 6.27976 3 7.11984 3 8.8V17.2C3 18.8802 3 19.7202 3.32698 20.362C3.6146 20.9265 4.07354 21.3854 4.63803 21.673C5.27976 22 6.11984 22 7.8 22Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function SiraFlipCell({ project, isHovered }) {
    return (
        <div className="pointer-events-none absolute inset-0 perspective-midrange">
            <motion.div
                className="relative h-full w-full"
                style={{ transformStyle: 'preserve-3d' }}
                animate={{ rotateX: isHovered ? 180 : 0 }}
                transition={FLIP_TRANSITION}
            >
                <span
                    className="absolute inset-0 flex h-full w-full items-center justify-center backface-hidden"
                    aria-hidden={isHovered}
                >
                    <span className="inline-flex items-center justify-center min-w-8 px-2 py-0.5 rounded-md bg-slate-100 text-xs font-bold text-slate-500 tabular-nums">
                        {project.sira}
                    </span>
                </span>

                <span
                    className="absolute inset-0 flex h-full w-full items-center justify-center text-slate-700 backface-hidden transform-[rotateX(180deg)_translateZ(1px)]"
                    aria-hidden={!isHovered}
                >
                    <HistoryIcon />
                </span>
            </motion.div>
        </div>
    );
}

export default SiraFlipCell;
