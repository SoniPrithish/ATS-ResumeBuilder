# LaTeX Resume with Automatic GitHub PDF Build
![Build Resume](https://github.com/SoniPrithish/resume/actions/workflows/build.yml/badge.svg)

This repository contains my resume written in **LaTeX**.
The PDF version is **automatically generated using GitHub Actions** whenever I push changes to the repository.

This allows me to:

* ✏️ Edit my resume locally using LaTeX
* 👀 Preview it locally before committing
* ☁️ Store the source on GitHub
* 🤖 Automatically generate the latest **resume.pdf** on every push

---
## Latest Resume

Download the latest version here:

https://yourusername.github.io/resume/Resume_PrithishSoni.pdf

# 📁 Repository Structure

```
resume/
│
├── resume.tex            # Main LaTeX resume file
├── resume.pdf            # Generated PDF (optional)
├── README.md
│
└── .github/
    └── workflows/
        └── build.yml     # GitHub Action that compiles LaTeX
```

---

# 🚀 How It Works

1. I edit `resume.tex` locally.
2. I preview the PDF locally using LaTeX.
3. I push changes to GitHub.
4. GitHub Actions automatically:

   * installs LaTeX
   * compiles the `.tex` file
   * generates `resume.pdf`.

The generated PDF can be downloaded from:

```
GitHub → Actions → Latest Workflow → Artifacts
```

---

# 💻 Local Development

### Install LaTeX

Linux (Ubuntu):

```
sudo apt install texlive-full
```

Mac:

```
brew install --cask mactex
```

Windows:

Install **MiKTeX** or **TeX Live**

---

### Compile the Resume

Run:

```
pdflatex resume.tex
```

This generates:

```
resume.pdf
```

---

# 🧑‍💻 Recommended Editor

VS Code works very well with LaTeX.

Recommended extension:

```
LaTeX Workshop
```

Features:

* auto compile
* PDF preview
* syntax highlighting
* forward/backward search

---

# ⚙️ GitHub Automation

The repository includes a GitHub workflow:

```
.github/workflows/build.yml
```

This workflow runs whenever code is pushed and compiles the LaTeX file automatically.

---

# 📄 License

MIT License

---

# ⭐ Why This Setup?

Benefits of using LaTeX + GitHub:

* Version control for resume history
* Professional PDF formatting
* Automated builds
* Easy sharing and backups
* Reproducible resume generation

----

# 📬 Contact

If you find this setup useful, feel free to fork the repository and use it for your own resume.
