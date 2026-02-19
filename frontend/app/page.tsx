"use client"

import { useState } from "react"

export default function Home() {
  const [file, setFile] = useState<File | null>(null)
  const [jdText, setJdText] = useState("")
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleAnalyze = async () => {
    if (!file || !jdText) return

    setLoading(true)

    try {
      // 1️⃣ Parse Resume
      const formData = new FormData()
      formData.append("file", file)

      const resumeRes = await fetch("http://localhost:8000/ai/parse-resume-pdf", {
        method: "POST",
        body: formData,
      })
      const resumeData = await resumeRes.json()

      // Extract skills (handling different naming conventions from the agent)
      const resumeSkills = resumeData.skills || resumeData.programming_languages || []
      console.log("Extracted Resume Skills:", resumeSkills)

      // 2️⃣ Store Resume Skills in Vector DB
      await fetch("http://localhost:8000/ai/store-resume-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skills: resumeSkills }),
      })

      // 3️⃣ Parse JD
      const jdResponse = await fetch("http://localhost:8000/ai/parse-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_text: jdText }),
      })

      const jdData = await jdResponse.json()
      console.log("JD Data:", jdData)

      if (!jdData.required_skills && !jdData.optional_skills) {
        console.error("Invalid JD Data Format", jdData)
        setLoading(false)
        return
      }

      const jdSkills = [...(jdData.required_skills || []), ...(jdData.optional_skills || [])]

      // 4️⃣ Match
      const matchResponse = await fetch("http://localhost:8000/ai/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jd_skills: jdSkills }),
      })

      const matchData = await matchResponse.json()
      setResult(matchData)
    } catch (error) {
      console.error("Error during analysis:", error)
      alert("An error occurred during analysis.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-10 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">HireSense AI</h1>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Upload Resume (PDF)</label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-slate-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100
            "
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Job Description</label>
          <textarea
            placeholder="Paste Job Description here..."
            className="w-full border rounded-lg p-3 h-40 focus:ring-2 focus:ring-blue-500 outline-none"
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={loading || !file || !jdText}
          className={`w-full py-3 rounded-lg text-white font-semibold transition-colors ${loading || !file || !jdText
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
            }`}
        >
          {loading ? "Analyzing..." : "Analyze Match"}
        </button>
      </div>

      {result && (
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Analysis Result</h2>
            <div className="text-xl font-semibold px-4 py-2 bg-blue-100 text-blue-800 rounded-full">
              Fit Score: {result.fit_score}%
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-green-50 p-4 rounded-xl border border-green-100">
              <h3 className="font-semibold text-green-800 mb-3 flex items-center">
                ✅ Matched Skills
              </h3>
              {result.matched_skills.length > 0 ? (
                <ul className="space-y-2">
                  {result.matched_skills.map((skill: string, i: number) => (
                    <li key={i} className="flex items-center text-green-700">
                      <span className="mr-2">•</span> {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-600 italic">No direct matches found.</p>
              )}
            </div>

            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <h3 className="font-semibold text-red-800 mb-3 flex items-center">
                ❌ Missing Skills
              </h3>
              {result.missing_skills.length > 0 ? (
                <ul className="space-y-2">
                  {result.missing_skills.map((skill: string, i: number) => (
                    <li key={i} className="flex items-center text-red-700">
                      <span className="mr-2">•</span> {skill}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-red-600 italic">No missing skills detected!</p>
              )}
            </div>
          </div>

          {result.recommendations && result.recommendations.length > 0 && (
            <div className="mt-8 bg-yellow-50 p-6 rounded-xl border border-yellow-100">
              <h3 className="text-lg font-bold text-yellow-800 mb-4">
                📚 Personalized Learning Recommendations
              </h3>
              <div className="space-y-6">
                {/* Check if recommendations is a string (raw LLM response) or parsed JSON */}
                {typeof result.recommendations === 'string' ? (
                  <div className="prose prose-sm max-w-none text-yellow-900 whitespace-pre-wrap">
                    {result.recommendations}
                  </div>
                ) : (
                  /* Assuming list of objects if structured */
                  Array.isArray(result.recommendations) ? (
                    result.recommendations.map((rec: any, i: number) => (
                      <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
                        <h4 className="font-bold text-gray-800">{rec.skill || "Skill"}</h4>
                        <p className="text-sm text-gray-600 mt-1">{rec.importance || rec.reason}</p>
                        {rec.learning_path && (
                          <ul className="mt-2 list-disc list-inside text-sm text-gray-700">
                            {Array.isArray(rec.learning_path) ? rec.learning_path.map((step: string, j: number) => (
                              <li key={j}>{step}</li>
                            )) : <li>{String(rec.learning_path)}</li>}
                          </ul>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="prose prose-sm max-w-none text-yellow-900">
                      {JSON.stringify(result.recommendations)}
                    </div>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
