import React, { useState } from 'react';
import tw from 'twin.macro';
import { LuFolder, LuChevronDown, LuChevronRight, LuTrash2, LuPen } from "react-icons/lu";

interface Props {
    name: string;
    count: number;
    onDelete?: () => void;
    onEdit?: () => void;
    onDrop: (serverIdentifier: string) => void;
    children: React.ReactNode;
}

const FolderItem = ({ name, count, onDelete, onEdit, onDrop, children }: Props) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const [isOver, setIsOver] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(true);
    };

    const handleDragLeave = () => {
        setIsOver(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsOver(false);
        const serverIdentifier = e.dataTransfer.getData('serverIdentifier');
        if (serverIdentifier) {
            onDrop(serverIdentifier);
        }
    };

    return (
        <div 
            className={`mb-4 rounded-xl border transition-all duration-300 ${isOver ? 'bg-flash/10 border-flash/40 scale-[1.01]' : 'bg-gray-700/30 border-gray-600/50'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <div className="flex items-center justify-between px-5 py-4 cursor-pointer group" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${isExpanded ? 'bg-flash text-white' : 'bg-gray-600 text-gray-300'}`}>
                        <LuFolder className="text-lg" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-gray-100">{name}</h3>
                        <p className="text-xs text-gray-400">{count} server{count !== 1 ? 's' : ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {onEdit && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onEdit(); }}
                            className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                        >
                            <LuPen size={16} />
                        </button>
                    )}
                    {onDelete && (
                        <button 
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            className="p-2 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                            <LuTrash2 size={16} />
                        </button>
                    )}
                    <div className="ml-2 text-gray-400">
                        {isExpanded ? <LuChevronDown /> : <LuChevronRight />}
                    </div>
                </div>
            </div>
            {isExpanded && (
                <div className="px-5 pb-5">
                    <div className="grid lg:grid-cols-2 gap-4">
                        {children}
                    </div>
                    {count === 0 && (
                        <p className="text-center py-8 text-sm text-gray-500 border-2 border-dashed border-gray-600/30 rounded-xl">
                            Drag servers here to organize
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default FolderItem;
