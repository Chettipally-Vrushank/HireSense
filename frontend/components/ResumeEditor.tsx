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
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50 animate-slide-up space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900">Tailored Resume Preview</h2>
                <div className="flex gap-4">
                    {onSavePersist && (
                        <button
                            onClick={onSavePersist}
                            disabled={isSaving}
                            className="px-6 py-2 border-2 border-indigo-600 text-indigo-600 font-bold rounded-xl hover:bg-indigo-50 transition-all disabled:opacity-50"
                        >
                            {isSaving ? "Saving..." : "Save for Later"}
                        </button>
                    )}
                    <button
                        onClick={onDownload}
                        className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-all shadow-md"
                    >
                        Export as PDF
                    </button>
                </div>
            </div>

            <div className="space-y-6">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <InputField label="Name" value={editedData.name} onChange={(v) => handleChange("name", v)} />
                    <InputField label="Email" value={editedData.email} onChange={(v) => handleChange("email", v)} />
                    <InputField label="Phone" value={editedData.phone} onChange={(v) => handleChange("phone", v)} />
                </div>

                {/* Summary */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Summary</label>
                    <textarea
                        className="w-full px-6 py-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:border-indigo-500 outline-none transition-all resize-none text-sm text-gray-900 font-medium"
                        rows={4}
                        value={editedData.summary}
                        onChange={(e) => handleChange("summary", e.target.value)}
                    />
                </div>

                {/* Experience */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">Experience</h3>
                    {editedData.experience?.map((exp: any, i: number) => (
                        <div key={i} className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <InputField label="Company" value={exp.company} onChange={(v) => handleArrayChange("experience", i, "company", v)} />
                                <InputField label="Role" value={exp.role} onChange={(v) => handleArrayChange("experience", i, "role", v)} />
                                <InputField label="Duration" value={exp.duration} onChange={(v) => handleArrayChange("experience", i, "duration", v)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-4">Bullet Points</label>
                                {exp.bullets?.map((bullet: string, j: number) => (
                                    <input
                                        key={j}
                                        className="w-full px-4 py-2 mb-2 rounded-xl border border-gray-100 bg-white focus:border-indigo-500 outline-none text-sm text-gray-800"
                                        value={bullet}
                                        onChange={(e) => {
                                            const newBullets = [...exp.bullets]
                                            newBullets[j] = e.target.value
                                            handleArrayChange("experience", i, "bullets", newBullets)
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function InputField({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4">{label}</label>
            <input
                className="w-full px-5 py-3 rounded-xl border border-gray-100 bg-gray-50/50 focus:border-indigo-500 outline-none transition-all text-sm text-gray-900 font-bold"
                value={value}
                onChange={(e) => onChange(e.target.value)}
            />
        </div>
    )
}
