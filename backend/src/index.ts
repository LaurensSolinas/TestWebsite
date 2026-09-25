import { onRequest } from "firebase-functions/v2/https";
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import express from "express";
import { Liquid } from "liquidjs";

initializeApp();
const tenants = getFirestore().collection("tenants");

const liquid = new Liquid({ outputEscape: "escape" });
const template = liquid.parse(`<!doctype html>
<html>
  <head><meta charset="utf-8"><title>{{ title }}</title></head>
  <body style="font-family: sans-serif; max-width: 600px; margin: 40px auto;">
    <h1>{{ title }}</h1>
    <p>{{ text }}</p>
  </body>
</html>`);

const app = express();
app.use(express.json());

app.get("/api/tenants", async (_req, res) => {
  const snap = await tenants.get();
  res.json(snap.docs.map((d) => d.data()));
});

app.post("/api/tenants", async (req, res) => {
  const { name, slug, title, text } = req.body ?? {};
  if (![name, slug, title, text].every((v) => typeof v === "string" && v.trim())) {
    res.status(400).json({ error: "name, slug, title en text zijn verplicht" });
    return;
  }
  const tenant = { name, slug, title, text };
  await tenants.doc(slug).set(tenant);
  res.status(201).json(tenant);
});

app.get("/site/:slug", async (req, res) => {
  const doc = await tenants.doc(req.params.slug).get();
  if (!doc.exists) {
    res.status(404).send("Tenant niet gevonden");
    return;
  }
  res.send(await liquid.render(template, doc.data()));
});

export const api = onRequest(app);
