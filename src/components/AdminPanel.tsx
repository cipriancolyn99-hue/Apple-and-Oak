import { useState } from "react";
import {
  useWorkers, useAddWorker, useRemoveWorker,
  useAnnouncements, useAddAnnouncement, useToggleAnnouncement, useRemoveAnnouncement,
  useFiles, useAddFile, useRemoveFile,
  useSiteContent, useUpdateContent,
} from "@/hooks/useApi";
import { Save, Plus, Trash2, Eye, EyeOff, Megaphone, FileText, Mail, MapPin, Users, Upload, File, Globe } from "lucide-react";

export function AdminPanel() {
  const { data: workersList, refetch: refetchWorkers } = useWorkers();
  const { data: announcementsList, refetch: refetchAnn } = useAnnouncements();
  const { data: filesList, refetch: refetchFiles } = useFiles();
  const { data: siteContentList } = useSiteContent();

  const addWorker = useAddWorker();
  const removeWorker = useRemoveWorker();
  const addAnnouncement = useAddAnnouncement();
  const toggleAnnouncement = useToggleAnnouncement();
  const removeAnnouncement = useRemoveAnnouncement();
  const addFile = useAddFile();
  const removeFile = useRemoveFile();
  const updateContent = useUpdateContent();

  const [saved, setSaved] = useState(false);
  const [tab, setTab] = useState<"pages" | "announcements" | "members" | "files">("pages");

  // Helper: get content value by key
  const getContent = (key: string) => siteContentList?.find((c) => c.key === key)?.value || "";

  // Editable fields (sync from API)
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [missionTitle, setMissionTitle] = useState("");
  const [missionText, setMissionText] = useState("");
  const [howWeHelpTitle, setHowWeHelpTitle] = useState("");
  const [howWeHelpText, setHowWeHelpText] = useState("");
  const [ourStoryTitle, setOurStoryTitle] = useState("");
  const [ourStoryText, setOurStoryText] = useState("");
  const [cEmail, setCEmail] = useState("");
  const [cWebsite, setCWebsite] = useState("");
  const [cAddress, setCAddress] = useState("");

  // Sync from API when data loads
  useState(() => {
    if (siteContentList) {
      setTagline(getContent("tagline"));
      setDescription(getContent("description"));
      setMissionTitle(getContent("missionTitle"));
      setMissionText(getContent("missionText"));
      setHowWeHelpTitle(getContent("howWeHelpTitle"));
      setHowWeHelpText(getContent("howWeHelpText"));
      setOurStoryTitle(getContent("ourStoryTitle"));
      setOurStoryText(getContent("ourStoryText"));
      setCEmail(getContent("contactEmail"));
      setCWebsite(getContent("contactWebsite"));
      setCAddress(getContent("contactAddress"));
    }
  });

  // New member
  const [mName, setMName] = useState("");
  const [mEmail, setMEmail] = useState("");
  const [mPass, setMPass] = useState("");
  const [mRole, setMRole] = useState("Staff");

  // New announcement
  const [aTitle, setATitle] = useState("");
  const [aContent, setAContent] = useState("");

  const handleSave = async () => {
    const updates = [
      { key: "tagline", value: tagline },
      { key: "description", value: description },
      { key: "missionTitle", value: missionTitle },
      { key: "missionText", value: missionText },
      { key: "howWeHelpTitle", value: howWeHelpTitle },
      { key: "howWeHelpText", value: howWeHelpText },
      { key: "ourStoryTitle", value: ourStoryTitle },
      { key: "ourStoryText", value: ourStoryText },
      { key: "contactEmail", value: cEmail },
      { key: "contactWebsite", value: cWebsite },
      { key: "contactAddress", value: cAddress },
    ];
    for (const u of updates) {
      await updateContent.mutateAsync(u);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddMember = async () => {
    if (mName.trim() && mEmail.trim() && mPass.trim()) {
      await addWorker.mutateAsync({
        name: mName.trim(),
        email: mEmail.trim(),
        password: mPass.trim(),
        role: mRole,
        avatar: mName.charAt(0).toUpperCase(),
      });
      setMName(""); setMEmail(""); setMPass("");
      refetchWorkers();
    }
  };

  const handleAddAnn = async () => {
    if (aTitle.trim() && aContent.trim()) {
      await addAnnouncement.mutateAsync({
        title: aTitle.trim(),
        content: aContent.trim(),
        date: new Date().toISOString().split("T")[0],
      });
      setATitle(""); setAContent("");
      refetchAnn();
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      const ext = file.name.split(".").pop() || "file";
      await addFile.mutateAsync({ name: file.name, size: `${sizeMB} MB`, type: ext, url: "#" });
      refetchFiles();
    }
  };

  const tabs = [
    { id: "pages" as const, label: "Pages", icon: <FileText className="w-4 h-4" /> },
    { id: "announcements" as const, label: "Announcements", icon: <Megaphone className="w-4 h-4" /> },
    { id: "members" as const, label: "Members", icon: <Users className="w-4 h-4" /> },
    { id: "files" as const, label: "Files", icon: <Upload className="w-4 h-4" /> },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-white" />
          <h2 className="text-white font-bold">Staff Panel</h2>
        </div>
        <button onClick={handleSave} className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${saved ? "bg-green-500 text-white" : "bg-white/20 hover:bg-white/30 text-white"}`}>
          <Save className="w-4 h-4" /> {saved ? "Saved!" : "Save"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 bg-white/5">
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className={`flex items-center gap-2 py-3 px-4 text-sm transition-colors whitespace-nowrap ${tab === t.id ? "text-violet-400 border-b-2 border-violet-400 bg-white/5" : "text-white/50 hover:text-white/80"}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* PAGES */}
        {tab === "pages" && (
          <>
            <Card title="Home" color="violet"><Input label="Tagline" value={tagline} onChange={setTagline} /><Area label="Description" value={description} onChange={setDescription} /></Card>
            <Card title="Mission" color="rose"><Input label="Title" value={missionTitle} onChange={setMissionTitle} /><Area label="Text" value={missionText} onChange={setMissionText} /></Card>
            <Card title="How We Help" color="teal"><Input label="Title" value={howWeHelpTitle} onChange={setHowWeHelpTitle} /><Area label="Description" value={howWeHelpText} onChange={setHowWeHelpText} /></Card>
            <Card title="Our Story" color="amber"><Input label="Title" value={ourStoryTitle} onChange={setOurStoryTitle} /><Area label="Text" value={ourStoryText} onChange={setOurStoryText} /></Card>
            <Card title="Contact" color="sky">
              <Input label="Email" value={cEmail} onChange={setCEmail} icon={<Mail className="w-4 h-4 text-sky-400" />} />
              <Input label="Website" value={cWebsite} onChange={setCWebsite} icon={<Globe className="w-4 h-4 text-sky-400" />} />
              <Input label="Address" value={cAddress} onChange={setCAddress} icon={<MapPin className="w-4 h-4 text-sky-400" />} />
            </Card>
          </>
        )}

        {/* ANNOUNCEMENTS */}
        {tab === "announcements" && (
          <>
            {announcementsList?.map((ann) => (
              <div key={ann.id} className={`bg-white/5 rounded-xl p-4 border ${ann.active ? "border-white/10" : "border-white/5 opacity-50"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold text-sm">{ann.title}</span>
                      {!ann.active && <span className="px-2 py-0.5 bg-gray-600 text-gray-300 text-[10px] rounded">Hidden</span>}
                    </div>
                    <p className="text-white/60 text-sm mt-1">{ann.content}</p>
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button onClick={() => { toggleAnnouncement.mutate({ id: ann.id }); refetchAnn(); }} className="p-1.5 hover:bg-white/10 rounded-lg">{ann.active ? <Eye className="w-4 h-4 text-green-400" /> : <EyeOff className="w-4 h-4 text-gray-400" />}</button>
                    <button onClick={() => { removeAnnouncement.mutate({ id: ann.id }); refetchAnn(); }} className="p-1.5 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-violet-500/10 rounded-xl p-4 border border-violet-500/20">
              <h4 className="text-violet-400 font-semibold text-sm mb-3"><Plus className="w-4 h-4 inline" /> New Announcement</h4>
              <input type="text" value={aTitle} onChange={(e) => setATitle(e.target.value)} placeholder="Title" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm mb-2 focus:outline-none focus:border-violet-400" />
              <textarea value={aContent} onChange={(e) => setAContent(e.target.value)} placeholder="Content" rows={2} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm mb-2 resize-none focus:outline-none focus:border-violet-400" />
              <button onClick={handleAddAnn} disabled={!aTitle.trim() || !aContent.trim()} className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">Add</button>
            </div>
          </>
        )}

        {/* MEMBERS */}
        {tab === "members" && (
          <>
            <div className="space-y-2">
              {workersList?.map((m) => (
                <div key={m.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white font-bold text-sm">{m.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium">{m.name}</div>
                    <div className="text-white/50 text-xs">{m.email} &middot; {m.role} {m.isOnline && <span className="text-green-400 ml-1">&bull; Online</span>}</div>
                  </div>
                  <button onClick={() => { removeWorker.mutate({ id: m.id }); refetchWorkers(); }} className="p-1.5 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              ))}
            </div>
            <div className="bg-violet-500/10 rounded-xl p-4 border border-violet-500/20">
              <h4 className="text-violet-400 font-semibold text-sm mb-3"><Plus className="w-4 h-4 inline" /> Add Member</h4>
              <input type="text" value={mName} onChange={(e) => setMName(e.target.value)} placeholder="Full name" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm mb-2 focus:outline-none focus:border-violet-400" />
              <input type="email" value={mEmail} onChange={(e) => setMEmail(e.target.value)} placeholder="Email" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm mb-2 focus:outline-none focus:border-violet-400" />
              <input type="text" value={mPass} onChange={(e) => setMPass(e.target.value)} placeholder="Password" className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/40 text-sm mb-2 focus:outline-none focus:border-violet-400" />
              <select value={mRole} onChange={(e) => setMRole(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm mb-2 focus:outline-none focus:border-violet-400">
                <option value="Staff" className="bg-[#0f1923]">Staff</option>
                <option value="Social Worker" className="bg-[#0f1923]">Social Worker</option>
                <option value="Admin" className="bg-[#0f1923]">Admin</option>
              </select>
              <button onClick={handleAddMember} disabled={!mName.trim() || !mEmail.trim() || !mPass.trim()} className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium">Add Member</button>
            </div>
          </>
        )}

        {/* FILES */}
        {tab === "files" && (
          <>
            <label className="flex flex-col items-center justify-center cursor-pointer py-6 bg-violet-500/10 rounded-xl border border-violet-500/20 border-dashed hover:bg-violet-500/20 transition-colors">
              <Upload className="w-8 h-8 text-violet-400 mb-2" />
              <span className="text-white font-medium text-sm">Click to upload file</span>
              <span className="text-white/50 text-xs">PDF, DOC, Images</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>

            <div className="space-y-2 mt-4">
              {filesList?.map((f) => (
                <div key={f.id} className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center"><File className="w-5 h-5 text-teal-400" /></div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-sm font-medium truncate">{f.name}</div>
                    <div className="text-white/50 text-xs">{f.size} &middot; {f.type.toUpperCase()}</div>
                  </div>
                  <button onClick={() => { removeFile.mutate({ id: f.id }); refetchFiles(); }} className="p-1.5 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                </div>
              ))}
              {(!filesList || filesList.length === 0) && <p className="text-white/30 text-sm text-center py-8">No files yet</p>}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Card({ title, color, children }: { title: string; color: string; children: React.ReactNode }) {
  const colors: Record<string, string> = { violet: "text-violet-400", rose: "text-rose-400", teal: "text-teal-400", amber: "text-amber-400", sky: "text-sky-400" };
  return <div className="bg-white/5 rounded-xl p-4 border border-white/10"><h3 className={`${colors[color] || "text-white"} font-semibold text-sm mb-3`}>{title}</h3><div className="space-y-3">{children}</div></div>;
}

function Input({ label, value, onChange, icon }: { label: string; value: string; onChange: (v: string) => void; icon?: React.ReactNode }) {
  return <div><label className="text-white/60 text-xs mb-1 block">{label}</label><div className="flex items-center gap-2">{icon}<input type="text" value={value} onChange={(e) => onChange(e.target.value)} className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-violet-400" /></div></div>;
}

function Area({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <div><label className="text-white/60 text-xs mb-1 block">{label}</label><textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm resize-none focus:outline-none focus:border-violet-400" /></div>;
}
