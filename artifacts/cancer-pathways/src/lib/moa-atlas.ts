import { DRUG_ENTRIES, type DrugEntry } from "./moa-drug-list.generated";

/**
 * Molecular MOA Atlas
 * -------------------
 * Maps every agent in the oncology medication list to the molecular target /
 * mechanism class it acts on, then positions those targets inside a 3D cell by
 * subcellular compartment. Drug→target assignment is grounded in:
 *   1. an explicit curated target→agents table (TARGET_AGENTS) for the agents
 *      with a well-defined molecular target, and
 *   2. WHO INN stem fallbacks (STEM_RULES, e.g. "-tinib" = kinase inhibitor),
 *   3. keyword fallbacks for biologics / supportive classes.
 * Anything still unresolved lands in a clearly-labelled "Other / supportive"
 * bucket rather than being silently dropped.
 */

export type Compartment =
  | "extracellular"
  | "membrane"
  | "cytoplasm"
  | "mitochondria"
  | "nucleus"
  | "systemic";

export interface TargetDef {
  key: string;
  label: string;
  compartment: Compartment;
  moaClass: string;
  pathway: string;
  description: string;
}

export const COMPARTMENTS: Record<
  Compartment,
  { label: string; y: number; radius: number; color: string }
> = {
  extracellular: { label: "Extracellular space", y: 12, radius: 13, color: "#5fd49b" },
  membrane: { label: "Plasma membrane · receptors", y: 6.5, radius: 12.5, color: "#4fd0e3" },
  cytoplasm: { label: "Cytoplasm · signalling kinases", y: 0.5, radius: 9, color: "#a98bff" },
  mitochondria: { label: "Mitochondria", y: -3.5, radius: 3.4, color: "#ff8a5c" },
  nucleus: { label: "Nucleus · DNA & transcription", y: -8, radius: 6.2, color: "#e0489b" },
  systemic: { label: "Extracellular / systemic · supportive & haematology", y: 1, radius: 24, color: "#f5b840" },
};

export const TARGETS: TargetDef[] = [
  // ---- Membrane receptors ----
  { key: "EGFR", label: "EGFR (HER1)", compartment: "membrane", moaClass: "RTK inhibitor / anti-EGFR", pathway: "RTK/RAS/MAPK", description: "Epidermal growth factor receptor. Blocked by EGFR-TKIs and anti-EGFR antibodies to shut down RAS/MAPK and PI3K signalling." },
  { key: "HER2", label: "HER2 (ERBB2)", compartment: "membrane", moaClass: "anti-HER2", pathway: "RTK/RAS/MAPK", description: "HER2 receptor tyrosine kinase, amplified in breast/gastric cancer. Targeted by antibodies, ADCs and HER2-selective TKIs." },
  { key: "HER3", label: "HER3 / NRG1", compartment: "membrane", moaClass: "anti-HER3", pathway: "RTK/RAS/MAPK", description: "HER3 (ERBB3) and NRG1-fusion signalling, targeted by HER3 ADCs and bispecific antibodies." },
  { key: "ALK", label: "ALK", compartment: "membrane", moaClass: "ALK inhibitor", pathway: "RTK/RAS/MAPK", description: "Anaplastic lymphoma kinase fusion oncoprotein in NSCLC; inhibited by successive generations of ALK-TKIs." },
  { key: "ROS1", label: "ROS1 / TRK", compartment: "membrane", moaClass: "ROS1/TRK inhibitor", pathway: "RTK/RAS/MAPK", description: "ROS1 and NTRK (TRK) fusion kinases; targeted by selective fusion-kinase inhibitors." },
  { key: "MET", label: "MET", compartment: "membrane", moaClass: "MET inhibitor", pathway: "RTK/RAS/MAPK", description: "Hepatocyte growth factor receptor (c-MET); MET exon14 / amplification driver targeted by TKIs and ADCs." },
  { key: "RET", label: "RET", compartment: "membrane", moaClass: "RET inhibitor", pathway: "RTK/RAS/MAPK", description: "RET fusion/mutation kinase in thyroid and lung cancer; blocked by selective RET inhibitors." },
  { key: "FGFR", label: "FGFR", compartment: "membrane", moaClass: "FGFR inhibitor", pathway: "RTK/RAS/MAPK", description: "Fibroblast growth factor receptor family; FGFR fusions/mutations targeted by pan-FGFR inhibitors." },
  { key: "KIT", label: "KIT / PDGFR", compartment: "membrane", moaClass: "KIT/PDGFR inhibitor", pathway: "RTK/RAS/MAPK", description: "KIT and PDGFR receptor kinases driving GIST and mastocytosis; blocked by selective and multikinase inhibitors." },
  { key: "FLT3", label: "FLT3", compartment: "membrane", moaClass: "FLT3 inhibitor", pathway: "RTK/RAS/MAPK", description: "FLT3-ITD/TKD receptor kinase in AML; targeted by FLT3 inhibitors." },
  { key: "CSF1R", label: "CSF1R", compartment: "membrane", moaClass: "CSF1R inhibitor", pathway: "TAM Immunosuppression", description: "Colony-stimulating-factor-1 receptor on macrophages; blockade depletes tumour-associated macrophages (e.g. tenosynovial giant cell tumour)." },
  { key: "VEGF", label: "VEGF / VEGFR", compartment: "membrane", moaClass: "anti-angiogenic", pathway: "Angiogenesis", description: "VEGF ligand and VEGFR2 axis driving tumour angiogenesis; blocked by antibodies, traps and multikinase VEGFR inhibitors." },
  { key: "SMO", label: "Smoothened (Hedgehog)", compartment: "membrane", moaClass: "Hedgehog inhibitor", pathway: "Hedgehog", description: "Smoothened receptor in the Hedgehog pathway; inhibited in basal cell carcinoma and AML." },
  { key: "NOTCH", label: "γ-secretase / Notch", compartment: "membrane", moaClass: "γ-secretase inhibitor", pathway: "Notch", description: "γ-secretase processing of Notch; inhibited in desmoid tumours." },
  { key: "GnRHR", label: "GnRH receptor", compartment: "membrane", moaClass: "GnRH agonist/antagonist", pathway: "Endocrine", description: "Pituitary GnRH receptor; agonists/antagonists suppress gonadal sex-hormone production in prostate and breast cancer." },
  { key: "SSTR", label: "Somatostatin receptor", compartment: "membrane", moaClass: "peptide-receptor radiotherapy", pathway: "Neuroendocrine", description: "Somatostatin receptors on neuroendocrine tumours, targeted by Lu-177 DOTATATE radioligand therapy." },
  { key: "CXCR4", label: "CXCR4", compartment: "membrane", moaClass: "CXCR4 antagonist", pathway: "Stem-cell mobilisation", description: "Chemokine receptor CXCR4; antagonism mobilises haematopoietic stem cells for collection." },
  { key: "P-selectin", label: "P-selectin", compartment: "membrane", moaClass: "anti-adhesion", pathway: "Cell adhesion", description: "P-selectin adhesion molecule; blockade reduces vaso-occlusion in sickle cell disease." },
  // ---- Surface antigens (antibody / ADC / cell-therapy targets) ----
  { key: "CD20", label: "CD20", compartment: "membrane", moaClass: "anti-CD20", pathway: "B-cell malignancy", description: "B-cell surface antigen CD20; targeted by antibodies, radio-immunoconjugates and CD20×CD3 bispecifics." },
  { key: "CD19", label: "CD19", compartment: "membrane", moaClass: "anti-CD19 / CAR-T", pathway: "B-cell malignancy", description: "B-cell antigen CD19; targeted by antibodies, ADCs, BiTEs and CD19 CAR-T cells." },
  { key: "CD22", label: "CD22", compartment: "membrane", moaClass: "anti-CD22 ADC", pathway: "B-cell malignancy", description: "B-cell antigen CD22; targeted by antibody–drug and immunotoxin conjugates." },
  { key: "CD30", label: "CD30", compartment: "membrane", moaClass: "anti-CD30 ADC", pathway: "Lymphoma", description: "CD30 on Hodgkin and anaplastic lymphoma; targeted by the ADC brentuximab vedotin." },
  { key: "CD33", label: "CD33", compartment: "membrane", moaClass: "anti-CD33 ADC", pathway: "Myeloid malignancy", description: "Myeloid antigen CD33; targeted by calicheamicin ADCs in AML." },
  { key: "CD38", label: "CD38", compartment: "membrane", moaClass: "anti-CD38", pathway: "Multiple myeloma", description: "Plasma-cell antigen CD38; targeted by antibodies in multiple myeloma." },
  { key: "CD52", label: "CD52", compartment: "membrane", moaClass: "anti-CD52", pathway: "Lymphoid malignancy", description: "Pan-lymphocyte antigen CD52; depleted by alemtuzumab." },
  { key: "CD79b", label: "CD79b", compartment: "membrane", moaClass: "anti-CD79b ADC", pathway: "B-cell malignancy", description: "B-cell receptor component CD79b; targeted by the ADC polatuzumab vedotin." },
  { key: "CD123", label: "CD123 (IL-3R)", compartment: "membrane", moaClass: "anti-CD123", pathway: "Myeloid malignancy", description: "IL-3 receptor α (CD123) on BPDCN/AML; targeted by fusion toxin and ADC." },
  { key: "BCMA", label: "BCMA", compartment: "membrane", moaClass: "anti-BCMA / CAR-T", pathway: "Multiple myeloma", description: "B-cell maturation antigen on plasma cells; targeted by ADCs, bispecifics and BCMA CAR-T cells." },
  { key: "GPRC5D", label: "GPRC5D", compartment: "membrane", moaClass: "anti-GPRC5D bispecific", pathway: "Multiple myeloma", description: "Plasma-cell antigen GPRC5D; targeted by the bispecific talquetamab." },
  { key: "SLAMF7", label: "SLAMF7", compartment: "membrane", moaClass: "anti-SLAMF7", pathway: "Multiple myeloma", description: "SLAMF7 on myeloma and NK cells; targeted by elotuzumab." },
  { key: "GD2", label: "GD2", compartment: "membrane", moaClass: "anti-GD2", pathway: "Neuroblastoma", description: "Disialoganglioside GD2 on neuroblastoma; targeted by anti-GD2 antibodies." },
  { key: "Nectin4", label: "Nectin-4", compartment: "membrane", moaClass: "anti-Nectin-4 ADC", pathway: "Urothelial cancer", description: "Nectin-4 on urothelial carcinoma; targeted by the ADC enfortumab vedotin." },
  { key: "TROP2", label: "TROP-2", compartment: "membrane", moaClass: "anti-TROP2 ADC", pathway: "Solid tumours", description: "TROP-2 epithelial antigen; targeted by topoisomerase-payload ADCs." },
  { key: "FRalpha", label: "Folate receptor α", compartment: "membrane", moaClass: "anti-FRα ADC", pathway: "Ovarian cancer", description: "Folate receptor α on ovarian cancer; targeted by mirvetuximab soravtansine and imaging dyes." },
  { key: "TF", label: "Tissue factor", compartment: "membrane", moaClass: "anti-TF ADC", pathway: "Cervical cancer", description: "Tissue factor (CD142); targeted by the ADC tisotumab vedotin." },
  { key: "CCR4", label: "CCR4", compartment: "membrane", moaClass: "anti-CCR4", pathway: "T-cell lymphoma", description: "Chemokine receptor CCR4 on T-cell lymphomas; depleted by mogamulizumab." },
  { key: "CLDN18", label: "Claudin-18.2", compartment: "membrane", moaClass: "anti-claudin18.2", pathway: "Gastric cancer", description: "Claudin-18.2 tight-junction protein on gastric cancer; targeted by zolbetuximab." },
  { key: "DLL3", label: "DLL3", compartment: "membrane", moaClass: "anti-DLL3 bispecific", pathway: "Small-cell lung cancer", description: "Delta-like ligand 3 on SCLC; targeted by the DLL3×CD3 engager tarlatamab." },
  { key: "gp100", label: "gp100 / TCR", compartment: "membrane", moaClass: "TCR bispecific", pathway: "Uveal melanoma", description: "gp100 peptide-HLA on melanoma; engaged by the ImmTAC tebentafusp." },
  { key: "PSMA", label: "PSMA", compartment: "membrane", moaClass: "PSMA radioligand", pathway: "Prostate cancer", description: "Prostate-specific membrane antigen; targeted by Lu-177 vipivotide radioligand therapy." },
  // ---- Immune checkpoints ----
  { key: "PD1", label: "PD-1", compartment: "membrane", moaClass: "anti-PD-1", pathway: "Immune Checkpoint", description: "Programmed death-1 receptor on T cells; blockade restores anti-tumour T-cell activity." },
  { key: "PDL1", label: "PD-L1", compartment: "membrane", moaClass: "anti-PD-L1", pathway: "Immune Checkpoint", description: "PD-1 ligand on tumour/immune cells; blockade releases T-cell suppression." },
  { key: "CTLA4", label: "CTLA-4", compartment: "membrane", moaClass: "anti-CTLA-4", pathway: "Immune Checkpoint", description: "CTLA-4 inhibitory receptor; blockade enhances T-cell priming." },
  { key: "LAG3", label: "LAG-3", compartment: "membrane", moaClass: "anti-LAG-3", pathway: "Immune Checkpoint", description: "LAG-3 inhibitory checkpoint; blocked by relatlimab in combination with nivolumab (Opdualag)." },
  // ---- Cytoplasmic signalling ----
  { key: "BCRABL", label: "BCR-ABL", compartment: "cytoplasm", moaClass: "BCR-ABL inhibitor", pathway: "CML", description: "BCR-ABL fusion tyrosine kinase of CML; inhibited at the ATP and myristoyl (STAMP) sites." },
  { key: "BTK", label: "BTK", compartment: "cytoplasm", moaClass: "BTK inhibitor", pathway: "B-cell receptor", description: "Bruton tyrosine kinase relaying B-cell-receptor signals; covalent and non-covalent inhibitors treat B-cell malignancies." },
  { key: "JAK", label: "JAK1/2", compartment: "cytoplasm", moaClass: "JAK inhibitor", pathway: "JAK/STAT", description: "Janus kinases driving JAK/STAT signalling in myelofibrosis and MPNs." },
  { key: "SYK", label: "SYK", compartment: "cytoplasm", moaClass: "SYK inhibitor", pathway: "B-cell receptor", description: "Spleen tyrosine kinase; inhibited in immune thrombocytopenia." },
  { key: "PI3K", label: "PI3K", compartment: "cytoplasm", moaClass: "PI3K inhibitor", pathway: "PI3K/AKT/mTOR", description: "Phosphoinositide-3-kinase isoforms (α/δ/γ) generating PIP3 for the AKT survival arm." },
  { key: "AKT", label: "AKT", compartment: "cytoplasm", moaClass: "AKT inhibitor", pathway: "PI3K/AKT/mTOR", description: "AKT/PKB serine-threonine kinase, central survival node downstream of PI3K." },
  { key: "mTOR", label: "mTOR", compartment: "cytoplasm", moaClass: "mTOR inhibitor", pathway: "PI3K/AKT/mTOR", description: "Mechanistic target of rapamycin controlling growth and metabolism; inhibited by rapalogs." },
  { key: "BRAF", label: "BRAF", compartment: "cytoplasm", moaClass: "BRAF inhibitor", pathway: "RTK/RAS/MAPK", description: "BRAF V600 kinase in melanoma/thyroid/colorectal cancer; blocked by selective and pan-RAF inhibitors." },
  { key: "MEK", label: "MEK", compartment: "cytoplasm", moaClass: "MEK inhibitor", pathway: "RTK/RAS/MAPK", description: "MEK1/2 in the MAPK cascade, inhibited alone or with BRAF/RAF inhibitors." },
  { key: "KRAS", label: "KRAS (G12C/D)", compartment: "cytoplasm", moaClass: "KRAS inhibitor", pathway: "RTK/RAS/MAPK", description: "Mutant KRAS GTPase; covalent G12C inhibitors (sotorasib, adagrasib) and non-covalent G12D inhibitors target the GDP-bound off state." },
  { key: "CDK46", label: "CDK4/6", compartment: "cytoplasm", moaClass: "CDK4/6 inhibitor", pathway: "Cell cycle", description: "Cyclin-dependent kinases 4/6 driving G1→S; inhibited in HR+ breast cancer and as myeloprotection." },
  { key: "PROTEASOME", label: "Proteasome", compartment: "cytoplasm", moaClass: "proteasome inhibitor", pathway: "Ubiquitin-Proteasome System", description: "26S proteasome; inhibition triggers proteotoxic stress in plasma cells (myeloma)." },
  { key: "TUBULIN", label: "Microtubules", compartment: "cytoplasm", moaClass: "antimicrotubule", pathway: "Mitosis", description: "Tubulin/microtubule dynamics; taxanes stabilise and vinca alkaloids/epothilones disrupt the mitotic spindle." },
  { key: "ROCK", label: "ROCK2", compartment: "cytoplasm", moaClass: "ROCK2 inhibitor", pathway: "Immune fibrosis", description: "Rho-associated kinase 2; inhibited in chronic graft-versus-host disease." },
  { key: "IDH", label: "IDH1/2", compartment: "cytoplasm", moaClass: "IDH inhibitor", pathway: "Metabolism / epigenetics", description: "Mutant isocitrate dehydrogenase producing 2-HG; inhibitors restore differentiation in AML and glioma." },
  { key: "XPO1", label: "Exportin-1 (XPO1)", compartment: "cytoplasm", moaClass: "SINE / nuclear export", pathway: "Nuclear transport", description: "Nuclear export protein XPO1; selinexor traps tumour-suppressor cargo in the nucleus." },
  { key: "HIF2A", label: "HIF-2α", compartment: "cytoplasm", moaClass: "HIF-2α inhibitor", pathway: "Hypoxia (VHL)", description: "Hypoxia-inducible factor-2α; belzutifan blocks the pseudo-hypoxic programme in VHL-driven cancers." },
  { key: "CEREBLON", label: "Cereblon (IMiD)", compartment: "cytoplasm", moaClass: "immunomodulatory (IMiD)", pathway: "Protein degradation", description: "Cereblon E3-ligase substrate adaptor; IMiDs redirect it to degrade Ikaros/Aiolos in myeloma." },
  { key: "TELOMERASE", label: "Telomerase", compartment: "cytoplasm", moaClass: "telomerase inhibitor", pathway: "Replicative immortality", description: "Telomerase RNA template; imetelstat inhibits it in lower-risk MDS." },
  { key: "PROTEINSYN", label: "Protein synthesis", compartment: "cytoplasm", moaClass: "translation inhibitor", pathway: "Translation", description: "Protein elongation machinery; omacetaxine inhibits translation in CML." },
  { key: "ODC", label: "Ornithine decarboxylase", compartment: "cytoplasm", moaClass: "ODC inhibitor", pathway: "Polyamine synthesis", description: "ODC in polyamine synthesis; eflornithine maintains response in high-risk neuroblastoma." },
  // ---- Mitochondria ----
  { key: "BCL2", label: "BCL-2", compartment: "mitochondria", moaClass: "BCL-2 inhibitor", pathway: "Apoptosis", description: "Anti-apoptotic BCL-2 on the outer mitochondrial membrane; BH3-mimetics restore apoptosis in CLL/AML." },
  // ---- Nucleus ----
  { key: "DNA_ALKYL", label: "DNA (alkylating)", compartment: "nucleus", moaClass: "alkylating agent", pathway: "DNA damage", description: "Alkylating and platinum agents that crosslink DNA, blocking replication and triggering apoptosis." },
  { key: "TOP1", label: "Topoisomerase I", compartment: "nucleus", moaClass: "topo-I inhibitor", pathway: "DNA replication", description: "Topoisomerase I; camptothecins trap the cleavage complex causing replication-fork collapse." },
  { key: "TOP2", label: "Topoisomerase II", compartment: "nucleus", moaClass: "topo-II inhibitor / anthracycline", pathway: "DNA replication", description: "Topoisomerase II; anthracyclines and epipodophyllotoxins induce double-strand breaks." },
  { key: "ANTIMETAB", label: "Nucleotide synthesis", compartment: "nucleus", moaClass: "antimetabolite", pathway: "DNA/RNA synthesis", description: "Antimetabolites mimicking purines/pyrimidines/folate to block DNA and RNA synthesis." },
  { key: "PARP", label: "PARP", compartment: "nucleus", moaClass: "PARP inhibitor", pathway: "DNA repair", description: "PARP1/2 single-strand-break repair enzymes; inhibition is synthetically lethal in BRCA-mutant cancers." },
  { key: "DNMT", label: "DNA methyltransferase", compartment: "nucleus", moaClass: "hypomethylating agent", pathway: "Epigenetic Regulation", description: "DNMTs maintaining DNA methylation; hypomethylating agents reactivate silenced genes in MDS/AML." },
  { key: "HDAC", label: "HDAC", compartment: "nucleus", moaClass: "HDAC inhibitor", pathway: "Epigenetic Regulation", description: "Histone deacetylases; inhibition reopens chromatin in T-cell lymphoma and myeloma." },
  { key: "EZH2", label: "EZH2", compartment: "nucleus", moaClass: "EZH2 inhibitor", pathway: "Epigenetic Regulation", description: "Polycomb methyltransferase EZH2; inhibited in epithelioid sarcoma and follicular lymphoma." },
  { key: "MENIN", label: "Menin-KMT2A", compartment: "nucleus", moaClass: "menin inhibitor", pathway: "Epigenetic Regulation", description: "Menin–KMT2A interaction driving leukaemic transcription; disrupted in KMT2A-r/NPM1 AML." },
  { key: "AR", label: "Androgen receptor", compartment: "nucleus", moaClass: "AR-axis therapy", pathway: "Endocrine", description: "Androgen receptor and its biosynthesis (CYP17); antagonists and synthesis blockers treat prostate cancer; androgens are used in some settings." },
  { key: "ER", label: "Estrogen receptor", compartment: "nucleus", moaClass: "ER-axis therapy", pathway: "Endocrine", description: "Estrogen receptor; SERMs, SERDs/degraders and aromatase inhibitors block estrogen-driven breast cancer." },
  { key: "GR", label: "Glucocorticoid receptor", compartment: "nucleus", moaClass: "corticosteroid / GR modulator", pathway: "Endocrine", description: "Glucocorticoid receptor; corticosteroids are cytotoxic/anti-emetic, and GR antagonists are used in Cushing-associated tumours." },
  { key: "RAR", label: "Retinoic acid receptor", compartment: "nucleus", moaClass: "retinoid / differentiation", pathway: "Differentiation", description: "Retinoid (RAR/RXR) receptors and PML-RARA; differentiating agents are central to APL therapy and cutaneous lymphoma." },
  { key: "PR", label: "Progesterone receptor", compartment: "nucleus", moaClass: "progestin", pathway: "Endocrine", description: "Progesterone receptor; progestins are used in endometrial/breast cancer and as appetite stimulants." },
  // ---- Systemic / supportive ----
  { key: "GCSF", label: "G-CSF / GM-CSF", compartment: "systemic", moaClass: "myeloid growth factor", pathway: "Haematopoiesis", description: "Granulocyte (and GM) colony-stimulating factors that accelerate neutrophil recovery after chemotherapy." },
  { key: "EPO", label: "Erythropoiesis (EPO/HIF-PH)", compartment: "systemic", moaClass: "erythropoiesis-stimulating", pathway: "Haematopoiesis", description: "Erythropoietin-receptor agonists and HIF-prolyl-hydroxylase inhibitors that raise red-cell production." },
  { key: "TPO", label: "Thrombopoiesis (TPO-R)", compartment: "systemic", moaClass: "TPO-receptor agonist", pathway: "Haematopoiesis", description: "Thrombopoietin-receptor agonists that raise platelet counts." },
  { key: "RANKL", label: "RANKL / bone", compartment: "systemic", moaClass: "bone-targeted", pathway: "Bone metabolism", description: "RANKL and bone mineral; denosumab and bisphosphonates reduce skeletal events from bone metastases." },
  { key: "IRON", label: "Iron handling", compartment: "systemic", moaClass: "iron supplement / chelator", pathway: "Iron metabolism", description: "Iron repletion (IV/oral iron) and iron chelation/hepcidin agents for overload or anaemia." },
  { key: "COAG", label: "Coagulation factors", compartment: "systemic", moaClass: "haemostatic / factor", pathway: "Coagulation", description: "Clotting-factor replacement, bypassing agents and rebalancing biologics for haemophilia and bleeding." },
  { key: "ANTIFIB", label: "Fibrinolysis / vWF", compartment: "systemic", moaClass: "antifibrinolytic / vWF", pathway: "Coagulation", description: "Antifibrinolytics and von-Willebrand-axis agents that stabilise clots." },
  { key: "COMPLEMENT", label: "Complement", compartment: "systemic", moaClass: "complement inhibitor", pathway: "Complement", description: "Complement (C5/C3/factor B/D/MASP-2/C1s) inhibitors for PNH, aHUS and TMA." },
  { key: "RBC", label: "Red-cell / platelet disorders", compartment: "systemic", moaClass: "blood-cell modifying", pathway: "Erythrocyte & platelet biology", description: "Agents modifying blood-cell biology (HbS polymerisation, PK activation, erythroid maturation, platelet reduction in MPN)." },
  { key: "ANTIEMETIC", label: "Antiemetic receptors", compartment: "systemic", moaClass: "antiemetic", pathway: "Supportive care", description: "5-HT3, NK1 and dopamine-receptor antagonists (and cannabinoids/benzodiazepines) preventing chemotherapy nausea." },
  { key: "TLS", label: "Uric acid / TLS", compartment: "systemic", moaClass: "anti-hyperuricaemic", pathway: "Supportive care", description: "Xanthine-oxidase and urate-oxidase agents preventing/treating tumour-lysis hyperuricaemia." },
  { key: "PROTECT", label: "Chemoprotectants / rescue", compartment: "systemic", moaClass: "cytoprotectant / rescue", pathway: "Supportive care", description: "Rescue and protectant agents (folinate, mesna, dexrazoxane, amifostine, glucarpidase, thiosulfate, uridine triacetate, palifermin, avasopasem)." },
  { key: "CYTOKINE", label: "Cytokine immunotherapy", compartment: "systemic", moaClass: "cytokine therapy", pathway: "Immune activation", description: "Interferons and interleukins (IL-2/IL-15) plus immune fusion proteins that broadly stimulate anti-tumour immunity." },
  { key: "CELLTHERAPY", label: "Cellular / vaccine therapy", compartment: "systemic", moaClass: "cell / oncolytic / vaccine", pathway: "Adoptive immunity", description: "Adoptive cell therapies (TIL/TCR/CAR beyond defined antigens), oncolytic viruses, cancer vaccines and stem-cell products." },
  { key: "GENETHERAPY", label: "Haematology gene therapy", compartment: "systemic", moaClass: "gene therapy", pathway: "Gene therapy", description: "Ex-vivo and AAV gene therapies for haemophilia and haemoglobinopathies." },
  { key: "RADIOPHARM", label: "Radiopharmaceuticals", compartment: "systemic", moaClass: "radiotherapeutic", pathway: "Targeted radiotherapy", description: "Systemic radioisotopes targeting bone or tumour-specific uptake (Ra-223, I-131 MIBG)." },
  { key: "TOPICAL", label: "Topical / photodynamic", compartment: "systemic", moaClass: "topical / photodynamic", pathway: "Local therapy", description: "Field/lesion-directed topical immunomodulators, photosensitisers and antimetabolites for skin lesions, plus imaging dyes." },
  { key: "DELIVERY", label: "Dispersion / delivery enzyme", compartment: "extracellular", moaClass: "drug-delivery adjuvant", pathway: "Supportive care", description: "Hyaluronidase enzymes that depolymerise extracellular-matrix hyaluronan to disperse and speed absorption of co-administered drugs/fluids. Not directly anti-tumour." },
  { key: "CNS", label: "Other targeted", compartment: "cytoplasm", moaClass: "other targeted", pathway: "Miscellaneous", description: "Targeted anti-cancer agents with mechanisms outside the main hubs (e.g. dordaviprone DRD2/ClpP in H3K27M glioma; mitotane adrenolytic)." },
  { key: "OTHER", label: "Specialised / non-oncology mechanism", compartment: "systemic", moaClass: "specialised mechanism", pathway: "Miscellaneous", description: "Agents on the list whose primary mechanism falls outside the oncology target hubs — immunomodulators (abatacept, CTLA4-Ig), rare-disease/metabolic agents (givosiran ALAS1 siRNA; burosumab anti-FGF23) and unclassified antibodies. Listed for completeness; verify mechanism against the label." },
];

/** Curated target → agent lists. Agent strings match the normalised names in
 * moa-drug-list.generated.ts (lowercase). Combination products are listed under
 * their primary novel mechanism. */
const TARGET_AGENTS: Record<string, string[]> = {
  EGFR: ["erlotinib","gefitinib","afatinib","dacomitinib","osimertinib","lazertinib","mobocertinib","sunvozertinib","cetuximab","panitumumab","necitumumab","amivantamab","amivantamab/hyaluronidase"],
  HER2: ["lapatinib","neratinib","tucatinib","trastuzumab","pertuzumab","margetuximab","zanidatamab","fam-trastuzumab deruxtecan","ado-trastuzumab emtansine","trastuzumab/hyaluronidase","pertuzumab/trastuzumab/hyaluronidase","zongertinib","sevabertinib"],
  HER3: ["patritumab deruxtecan","zenocutuzumab"],
  ALK: ["alectinib","brigatinib","ceritinib","crizotinib","lorlatinib","ensartinib"],
  ROS1: ["entrectinib","larotrectinib","repotrectinib","taletrectinib"],
  MET: ["capmatinib","tepotinib","telisotuzumab vedotin"],
  RET: ["selpercatinib","pralsetinib"],
  FGFR: ["erdafitinib","pemigatinib","infigratinib","futibatinib"],
  KIT: ["avapritinib","ripretinib","bezuclastinib","pexidartinib"],
  FLT3: ["midostaurin","gilteritinib","quizartinib"],
  CSF1R: ["axatilimab","vimseltinib"],
  VEGF: ["bevacizumab","ramucirumab","ziv-aflibercept","sorafenib","sunitinib","pazopanib","regorafenib","cabozantinib","lenvatinib","axitinib","tivozanib","vandetanib","fruquintinib","rivoceranib","zanzalintinib"],
  SMO: ["vismodegib","sonidegib","glasdegib"],
  NOTCH: ["nirogacestat"],
  GnRHR: ["leuprolide","goserelin","histrelin","triptorelin","degarelix","relugolix"],
  SSTR: ["lutetium lu 177 dotatate"],
  CXCR4: ["motixafortide","plerixafor"],
  "P-selectin": ["crizanlizumab"],
  CD20: ["rituximab","rituximab/hyaluronidase","obinutuzumab","ofatumumab","ibritumomab tiuxetan","mosunetuzumab","glofitamab","epcoritamab","odronextamab"],
  CD19: ["tafasitamab","loncastuximab tesirine","blinatumomab","axicabtagene ciloleucel","brexucabtagene autoleucel","lisocabtagene maraleucel","tisagenlecleucel","obecabtagene autoleucel"],
  CD22: ["inotuzumab ozogamicin","moxetumomab pasudotox"],
  CD30: ["brentuximab vedotin"],
  CD33: ["gemtuzumab ozogamicin"],
  CD38: ["daratumumab","daratumumab/hyaluronidase","isatuximab"],
  CD52: ["alemtuzumab"],
  CD79b: ["polatuzumab vedotin"],
  CD123: ["tagraxofusp","pivekimab sunirine"],
  BCMA: ["belantamab mafodotin","teclistamab","elranatamab","linvoseltamab","idecabtagene vicleucel","ciltacabtagene autoleucel"],
  GPRC5D: ["talquetamab"],
  SLAMF7: ["elotuzumab"],
  GD2: ["dinutuximab","naxitamab"],
  Nectin4: ["enfortumab vedotin"],
  TROP2: ["sacituzumab govitecan","datopotamab deruxtecan"],
  FRalpha: ["mirvetuximab soravtansine","pafolacianine"],
  TF: ["tisotumab vedotin"],
  CCR4: ["mogamulizumab"],
  CLDN18: ["zolbetuximab"],
  DLL3: ["tarlatamab"],
  gp100: ["tebentafusp"],
  PSMA: ["lutetium lu 177 vipivotide tetraxetan"],
  PD1: ["pembrolizumab","pembrolizumab/berahyaluronidase alfa","nivolumab","nivolumab/hyaluronidase","nivolumab/relatlimab","cemiplimab","dostarlimab","retifanlimab","toripalimab","tislelizumab","camrelizumab","penpulimab"],
  PDL1: ["atezolizumab","atezolizumab/hyaluronidase","avelumab","durvalumab","cosibelimab"],
  CTLA4: ["ipilimumab","tremelimumab"],
  LAG3: ["relatlimab"],
  BCRABL: ["imatinib","dasatinib","nilotinib","bosutinib","ponatinib","asciminib"],
  BTK: ["ibrutinib","acalabrutinib","zanubrutinib","pirtobrutinib","tirabrutinib","remibrutinib","rilzabrutinib"],
  JAK: ["ruxolitinib","fedratinib","pacritinib","momelotinib"],
  SYK: ["fostamatinib"],
  PI3K: ["copanlisib","duvelisib","idelalisib","alpelisib","umbralisib","inavolisib","gedatolisib"],
  AKT: ["capivasertib"],
  mTOR: ["everolimus","temsirolimus","sirolimus","sirolimus albumin-bound"],
  BRAF: ["dabrafenib","encorafenib","vemurafenib","tovorafenib"],
  MEK: ["trametinib","cobimetinib","binimetinib","selumetinib","mirdametinib","avutometinib and defactinib"],
  KRAS: ["sotorasib","adagrasib"],
  CDK46: ["abemaciclib","palbociclib","ribociclib","trilaciclib","ribociclib and letrozole"],
  PROTEASOME: ["bortezomib","carfilzomib","ixazomib"],
  TUBULIN: ["paclitaxel","paclitaxel albumin-bound","docetaxel","cabazitaxel","vinblastine","vincristine","vincristine liposomal","vinorelbine","eribulin","ixabepilone","estramustine","tirbanibulin"],
  ROCK: ["belumosudil"],
  IDH: ["ivosidenib","enasidenib","olutasidenib","vorasidenib"],
  XPO1: ["selinexor"],
  HIF2A: ["belzutifan"],
  CEREBLON: ["lenalidomide","pomalidomide","thalidomide","iberdomide"],
  TELOMERASE: ["imetelstat"],
  PROTEINSYN: ["omacetaxine mepesuccinate"],
  ODC: ["eflornithine"],
  BCL2: ["venetoclax","sonrotoclax"],
  DNA_ALKYL: ["cyclophosphamide","ifosfamide","melphalan","chlorambucil","bendamustine","mechlorethamine","busulfan","treosulfan","thiotepa","carmustine","lomustine","streptozocin","temozolomide","dacarbazine","procarbazine","cisplatin","carboplatin","oxaliplatin","mitomycin","mitomycin pyelocalyceal","trabectedin","lurbinectedin","bleomycin","dactinomycin"],
  TOP1: ["irinotecan","irinotecan liposomal","topotecan"],
  TOP2: ["doxorubicin","doxorubicin liposomal","daunorubicin","daunorubicin/cytarabine liposomal","epirubicin","idarubicin","valrubicin","mitoxantrone","etoposide","etoposide phosphate"],
  ANTIMETAB: ["methotrexate","pralatrexate","pemetrexed","fluorouracil","capecitabine","floxuridine","trifluridine/tipiracil","gemcitabine","cytarabine","nelarabine","cladribine","fludarabine","clofarabine","pentostatin","mercaptopurine","thioguanine","hydroxyurea","asparaginase","asparaginase erwinia chrysanthemi","calaspargase pegol","pegaspargase"],
  PARP: ["olaparib","niraparib","rucaparib","talazoparib","niraparib/abiraterone acetate"],
  DNMT: ["azacitidine","decitabine","decitabine/cedazuridine"],
  HDAC: ["vorinostat","romidepsin","belinostat","panobinostat"],
  EZH2: ["tazemetostat"],
  MENIN: ["revumenib","ziftomenib"],
  AR: ["bicalutamide","enzalutamide","apalutamide","darolutamide","flutamide","nilutamide","abiraterone acetate","abiraterone acetate micronized","testosterone enanthate","methyltestosterone","fluoxymesterone"],
  ER: ["tamoxifen","toremifene","raloxifene","fulvestrant","elacestrant","imlunestrant","vepdegestrant","anastrozole","letrozole","exemestane","estradiol","estradiol valerate","estrogens, conjugated","estrogens, esterified"],
  GR: ["dexamethasone","dexamethasone sodium phosphate","relacorilant"],
  RAR: ["tretinoin","alitretinoin","bexarotene","arsenic trioxide"],
  PR: ["megestrol"],
  GCSF: ["filgrastim (g-csf)","pegfilgrastim (g-csf)","tbo-filgrastim (g-csf)","eflapegrastim (g-csf)","efbemalenograstim alfa (g-csf)","sargramostim (gm-csf)"],
  EPO: ["epoetin alfa","darbepoetin alfa","methoxy polyethylene glycol-epoetin beta","daprodustat","vadadustat"],
  TPO: ["eltrombopag","avatrombopag","lusutrombopag","romiplostim"],
  RANKL: ["denosumab","pamidronate","zoledronic acid 4 mg"],
  IRON: ["ferric carboxymaltose","ferric citrate","ferric derisomaltose","ferric maltol","ferric pyrophosphate citrate","ferrous fumarate","ferrous gluconate","ferrous sulfate","ferumoxytol","iron dextran","iron sucrose","sodium ferric gluconate complex","deferasirox","deferiprone","deferoxamine","rusfertide"],
  COAG: ["antihemophilic factor (factor viii, human)","antihemophilic factor (factor viii, human)/von willebrand factor complex","antihemophilic factor (factor viii, recombinant)","antihemophilic factor (factor viii, recombinant), fc fusion protein","antihemophilic factor (factor viii, recombinant), glycopegylated","antihemophilic factor (factor viii, recombinant), pegylated","antihemophilic factor (factor viii, recombinant), porcine","antihemophilic factor (factor viii, recombinant), single chain","antihemophilic factor, fc-vwf-xten fusion protein","coagulation factor ix","coagulation factor ix complex","coagulation factor ix, albumin fusion protein","coagulation factor ix, fc fusion protein","coagulation factor ix, glycopegylated","coagulation factor viia","coagulation factor x","coagulation factor xa, inactivated","coagulation factor xiii a-subunit","factor xiii concentrate","fibrinogen","prothrombin complex concentrate","anti-inhibitor coagulant complex","emicizumab","concizumab","marstacimab","fitusiran","phytonadione (vitamin k1)"],
  ANTIFIB: ["aminocaproic acid","tranexamic acid","desmopressin","desmopressin nasal","von willebrand factor","caplacizumab","adamts13, recombinant","plasminogen, human"],
  COMPLEMENT: ["eculizumab","ravulizumab","crovalimab","pegcetacoplan","iptacopan","danicopan","narsoplimab","sutimlimab"],
  RBC: ["voxelotor","l-glutamine","mitapivat","luspatercept","anagrelide"],
  ANTIEMETIC: ["ondansetron","granisetron","granisetron transdermal","palonosetron","netupitant/palonosetron","fosnetupitant/palonosetron","aprepitant","fosaprepitant","rolapitant","tradipitant","prochlorperazine maleate","prochlorperazine edisylate","prochlorperazine rectal","promethazine","promethazine rectal","metoclopramide","olanzapine","dronabinol","nabilone","scopolamine","scopolamine transdermal","lorazepam","chlorpromazine","perphenazine","amisulpride","trimethobenzamide"],
  TLS: ["allopurinol","rasburicase"],
  PROTECT: ["leucovorin","levoleucovorin","mesna","dexrazoxane","amifostine","glucarpidase","sodium thiosulfate","uridine triacetate","palifermin","avasopasem","dimethyl sulfoxide","talc"],
  CYTOKINE: ["interferon alfa 2b","ropeginterferon alfa-2b","aldesleukin","nogapendekin alfa inbakicept","denileukin diftitox","siltuximab","emapalumab"],
  CELLTHERAPY: ["lifileucel","afamitresgene autoleucel","tabelecleucel","remestemcel-l","sipuleucel-t","talimogene laherparepvec","nadofaragene firadenovec","allogeneic cell therapy","omidubicel","bcg live"],
  GENETHERAPY: ["betibeglogene autotemcel","exagamglogene autotemcel","lovotibeglogene autotemcel","valoctocogene roxaparvovec","etranacogene dezaparvovec","fidanacogene elaparvovec"],
  RADIOPHARM: ["radium ra 223 dichloride","iobenguane i 131"],
  TOPICAL: ["methoxsalen","aminolevulinic acid","ingenol mebutate","imiquimod","porfimer","diclofenac","bexarotene topical","fluorouracil topical","pegulicianine"],
  DELIVERY: ["hyaluronidase","amphadase"],
  CNS: ["dordaviprone","mitotane"],
  OTHER: ["abatacept","givosiran","burosumab","afamelanotide"],
};

/** Flat lookup: agent name → target key. Built eagerly before classifyOne is called. */
const FLAT: Record<string, string> = (() => {
  const m: Record<string, string> = {};
  for (const [target, agents] of Object.entries(TARGET_AGENTS))
    for (const a of agents) m[a] = target;
  return m;
})();

const STEM_RULES: { re: RegExp; target: string }[] = [
  { re: /ciclib$/, target: "CDK46" },
  { re: /parib$/, target: "PARP" },
  { re: /lisib$/, target: "PI3K" },
  { re: /zomib$/, target: "PROTEASOME" },
  { re: /degib$/, target: "SMO" },
  { re: /(sidenib|idenib)$/, target: "IDH" },
  { re: /metinib$/, target: "MEK" },
  { re: /tinib$/, target: "VEGF" },
  { re: /(rubicin|mycin)$/, target: "TOP2" },
  { re: /platin$/, target: "DNA_ALKYL" },
  { re: /(taxel|taxane)$/, target: "TUBULIN" },
  { re: /(citabine|tabine|arabine|ribine|racil|uridine)$/, target: "ANTIMETAB" },
  { re: /(mustine|mustard|sulfan|tepa|phamide|fosfamide)$/, target: "DNA_ALKYL" },
  { re: /tecan$/, target: "TOP1" },
  { re: /grastim/, target: "GCSF" },
  { re: /(poetin|epoetin)/, target: "EPO" },
  { re: /(trombopag|plostim)$/, target: "TPO" },
  { re: /dronate$|dronic/, target: "RANKL" },
  { re: /setron$/, target: "ANTIEMETIC" },
  { re: /pitant$/, target: "ANTIEMETIC" },
  { re: /relix$|relin$|relix/, target: "GnRHR" },
  { re: /(estrant|estrol|estradiol|fulvestrant)$/, target: "ER" },
  { re: /(lutamide|terone)$/, target: "AR" },
  { re: /(leucel|autoleucel|cabtagene)$/, target: "CELLTHERAPY" },
  { re: /(autotemcel|parvovec|firadenovec|elaparvovec|roxaparvovec)$/, target: "GENETHERAPY" },
];

const KEYWORD_RULES: { kw: RegExp; target: string }[] = [
  { kw: /antihemophilic|coagulation factor|prothrombin|fibrinogen|factor (viii|ix|x|xiii|viia)|coagulant complex/, target: "COAG" },
  { kw: /von willebrand|aminocaproic|tranexamic|desmopressin|plasminogen|adamts13|caplacizumab/, target: "ANTIFIB" },
  { kw: /ferric|ferrous|iron |ferumoxytol|defer/, target: "IRON" },
  { kw: /interferon|aldesleukin|interleukin/, target: "CYTOKINE" },
  { kw: /estrogen/, target: "ER" },
  { kw: /testosterone|androsterone|methyltest/, target: "AR" },
  { kw: /^hyaluronidase|^amphadase/, target: "DELIVERY" },
  { kw: /-cel$|cell therapy|leucel/, target: "CELLTHERAPY" },
];

function classifyOne(agent: string): { target: string; confidence: "high" | "class" | "low" } {
  // 1. exact curated
  if (FLAT[agent]) return { target: FLAT[agent], confidence: "high" };
  // 2. keyword rules
  for (const r of KEYWORD_RULES) if (r.kw.test(agent)) return { target: r.target, confidence: "class" };
  // 3. INN stem rules
  for (const r of STEM_RULES) if (r.re.test(agent)) return { target: r.target, confidence: "class" };
  // generic monoclonal antibody fallback
  if (/mab$/.test(agent)) return { target: "OTHER", confidence: "low" };
  return { target: "OTHER", confidence: "low" };
}

export interface AtlasDrug {
  brand: string;
  generic: string;
  agent: string;
  confidence: "high" | "class" | "low";
}

export interface AtlasTarget extends TargetDef {
  position: [number, number, number];
  drugs: AtlasDrug[];
}

export interface Atlas {
  targets: AtlasTarget[];
  targetByKey: Map<string, AtlasTarget>;
  totalDrugs: number;
  classifiedAgents: number;
}

let _atlas: Atlas | null = null;

export function buildAtlas(): Atlas {
  if (_atlas) return _atlas;

  const drugsByTarget = new Map<string, AtlasDrug[]>();
  const seenAgent = new Set<string>();

  for (const e of DRUG_ENTRIES as DrugEntry[]) {
    const { target, confidence } = classifyOne(e.agent);
    const list = drugsByTarget.get(target) ?? [];
    list.push({ ...e, confidence });
    drugsByTarget.set(target, list);
    seenAgent.add(e.agent);
  }

  // Lay out targets per compartment on a ring in the x-z plane.
  const byCompartment = new Map<Compartment, TargetDef[]>();
  for (const t of TARGETS) {
    if (!drugsByTarget.has(t.key)) continue; // hide empty targets
    const arr = byCompartment.get(t.compartment) ?? [];
    arr.push(t);
    byCompartment.set(t.compartment, arr);
  }

  // Lay out targets per compartment as one or more stacked rings (a "shell"),
  // so dense compartments (e.g. ~40 membrane receptors) don't overlap.
  const PER_RING: Partial<Record<Compartment, number>> = {
    membrane: 13,
    cytoplasm: 9,
    nucleus: 8,
    systemic: 11,
    extracellular: 9,
    mitochondria: 4,
  };
  const ROW_GAP: Partial<Record<Compartment, number>> = {
    membrane: 2.0,
    cytoplasm: 2.0,
    nucleus: 1.7,
    systemic: 2.4,
    extracellular: 1.7,
    mitochondria: 1.6,
  };

  const targets: AtlasTarget[] = [];
  for (const [comp, defs] of byCompartment) {
    const meta = COMPARTMENTS[comp];
    const n = defs.length;
    const perRing = PER_RING[comp] ?? 10;
    const rowGap = ROW_GAP[comp] ?? 2.0;
    const rows = Math.max(1, Math.ceil(n / perRing));
    defs.forEach((d, i) => {
      const row = Math.floor(i / perRing);
      const idxInRow = i % perRing;
      const countInRow = Math.min(perRing, n - row * perRing);
      const ang =
        countInRow <= 1
          ? 0
          : (idxInRow / countInRow) * Math.PI * 2 + row * 0.45;
      const r = n <= 1 ? 0 : meta.radius;
      const y = meta.y + (row - (rows - 1) / 2) * rowGap;
      targets.push({
        ...d,
        position: [Math.cos(ang) * r, y, Math.sin(ang) * r],
        drugs: (drugsByTarget.get(d.key) ?? []).sort((a, b) =>
          a.agent.localeCompare(b.agent),
        ),
      });
    });
  }

  const targetByKey = new Map(targets.map((t) => [t.key, t]));
  _atlas = {
    targets,
    targetByKey,
    totalDrugs: Array.from(drugsByTarget.values()).reduce((s, a) => s + a.length, 0),
    classifiedAgents: seenAgent.size,
  };
  return _atlas;
}
