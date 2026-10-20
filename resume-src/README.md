# Resume source

`resume.html` is the source of `assets/resume/Lee_Jian_Lin_Resume.pdf` (the file the website's Download buttons use).
It is deliberately ATS-friendly: one column, real text, standard section headings, no tables, images or icons.

## Update the PDF

1. Edit `resume.html`.
2. Export it to PDF with Edge (run from the repository root; Windows / Git Bash):

```bash
"/c/Program Files (x86)/Microsoft/Edge/Application/msedge.exe" --headless --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$(cygpath -w "$PWD/assets/resume/Lee_Jian_Lin_Resume.pdf")" "file:///$PWD/resume-src/resume.html"
```

Or open `resume.html` in Edge/Chrome, press Ctrl+P, choose "Save as PDF", paper size A4, and turn **Headers and footers** off.

## ATS check

Open the PDF and press Ctrl+A / Ctrl+C: the pasted text should read top to bottom in order, with each date next to its job title.
