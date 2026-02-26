"use client"

import { useState } from "react"

export default function ResumeEditor({
    data,
    onSave,
    onDownload,
    onSavePersist,
    isSaving
}: {
    data: any,
    onSave: (newData: any) => void,
    onDownload: () => void,
    onSavePersist?: () => void,
    isSaving?: boolean
}) {
    const [editedData, setEditedData] = useState(data)

    const handleChange = (path: string, value: any) => {
        const newData = { ...editedData }
        const parts = path.split(".")
        let current = newData
        for (let i = 0; i < parts.length - 1; i++) {
            current = current[parts[i]]
        }
        current[parts[parts.length - 1]] = value
        setEditedData(newData)
        onSave(newData)
    }

    const handleArrayChange = (path: string, index: number, field: string, value: any) => {
        const newData = { ...editedData }
        const parts = path.split(".")
        let current = newData
        for (let i = 0; i < parts.length; i++) {
            current = current[parts[i]]
        }
        current[index][field] = value
        setEditedData(newData)
        onSave(newData)
    }

    return (
        <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-8 sm:p-12 border border-white/10 shadow-2xl animate-slide-up space-y-12">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 pb-8 border-b border-white/5">
                <div>
                    <h2 className="text-3xl font-black text-white tracking-tight">Content Editor</h2>
                    <p className="text-white/40 font-medium text-sm mt-1">Refine your AI-generated results.</p>
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    {onSavePersist && (
                        <button
                            onClick={onSavePersist}
                            disabled={isSaving}
                            className="flex-1 sm:flex-none px-8 py-3 bg-white/5 border border-white/10 text-white font-bold rounded-2xl hover:bg-white/10 transition-all disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save Draft"}
                        </button>
                    )}
                    <button
                        onClick={onDownload}
                        className="flex-1 sm:flex-none px-8 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/20"
                    >
                        Export PDF
                    </button>
                </div>
            </div>

            <div className="space-y-10">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InputField label="Full Name" value={editedData.name} onChange={(v) => handleChange("name", v)} />
                    <InputField label="Email Address" value={editedData.email} onChange={(v) => handleChange("email", v)} />
                    <InputField label="Phone Number" value={editedData.phone} onChange={(v) => handleChange("phone", v)} />
                </div>

                {/* Summary */}
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-2">Professional Summary</label>
                    <textarea
                        className="w-full px-8 py-6 rounded-[2rem] border border-white/5 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all resize-none text-sm text-white/90 font-medium leading-relaxed"
                        rows={6}
                        value={editedData.summary}
                        onChange={(e) => handleChange("summary", e.target.value)}
                    />
                </div>

                {/* Experience */}
                <div className="space-y-8">
                    <div className="flex items-center gap-4">
                        <h3 className="text-xl font-black text-white">Experience</h3>
                        <div className="flex-1 h-px bg-white/5" />
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {editedData.experience?.map((exp: any, i: number) => (
                            <div key={i} className="bg-white/5 rounded-[2.5rem] p-8 border border-white/10 space-y-8 relative group/card hover:border-indigo-500/30 transition-all">
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <InputField label="Company" value={exp.company} onChange={(v) => handleArrayChange("experience", i, "company", v)} />
                                    <InputField label="Role" value={exp.role} onChange={(v) => handleArrayChange("experience", i, "role", v)} />
                                    <InputField label="Duration" value={exp.duration} onChange={(v) => handleArrayChange("experience", i, "duration", v)} />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-2 flex items-center gap-2">
                                        Professional Highlights
                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                    </label>
                                    <div className="space-y-3">
                                        {exp.bullets?.map((bullet: string, j: number) => (
                                            <div key={j} className="relative group/bullet">
                                                <input
                                                    className="w-full px-6 py-4 rounded-xl border border-white/5 bg-black/20 focus:border-indigo-500 focus:bg-white/5 outline-none text-sm text-white/70 font-medium transition-all"
                                                    value={bullet}
                                                    onChange={(e) => {
                                                        const newBullets = [...exp.bullets]
                                                        newBullets[j] = e.target.value
                                                        handleArrayChange("experience", i, "bullets", newBullets)
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function InputField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-2">
            <label className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] px-2">{label}</label>
            <input
                className="w-full px-6 py-4 rounded-2xl border border-white/5 bg-white/5 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all text-sm text-white font-bold"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}
