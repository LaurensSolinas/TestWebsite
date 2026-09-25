import { useEffect, useState, type FormEvent } from "react";

type Tenant = { name: string; slug: string; title: string; text: string };

const empty: Tenant = { name: "", slug: "", title: "", text: "" };

export default function App() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [form, setForm] = useState<Tenant>(empty);

  const load = () =>
    fetch("/api/tenants")
      .then((r) => r.json())
      .then(setTenants);

  useEffect(() => {
    load();
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch("/api/tenants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm(empty);
    load();
  };

  return (
    <main>
      <h1>Tenants</h1>
      <form onSubmit={submit}>
        {(["name", "slug", "title"] as const).map((key) => (
          <input
            key={key}
            placeholder={key}
            value={form[key]}
            onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            required
          />
        ))}
        <textarea
          placeholder="text"
          value={form.text}
          onChange={(e) => setForm({ ...form, text: e.target.value })}
          required
        />
        <button type="submit">Toevoegen</button>
      </form>
      <ul>
        {tenants.map((t) => (
          <li key={t.slug}>
            {t.name} — <a href={`/site/${t.slug}`}>/site/{t.slug}</a>
          </li>
        ))}
      </ul>
    </main>
  );
}
