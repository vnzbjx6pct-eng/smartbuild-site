# SmartBuild

SmartBuild on ehitusmaterjalide hinnavõrdlusplatvorm (Eesti turg).

## Arendus (Local Development)

1.  Intstalleri sõltuvused:
    ```bash
    npm install
    ```
2.  Käivita arendus-server:
    ```bash
    npm run dev
    ```
3.  Ava [http://localhost:3000](http://localhost:3000).

## Vercel Deployment

Projekt on optimeeritud Vercel jaoks.
Lihtsalt ühenda oma GitHub repo Vercel-iga ja `git push`.

### Keskkonnamuutujad (Environment Variables)

Emailide saatmiseks (valikuline):
- `SMTP_HOST`: (nt. smtp.gmail.com)
- `SMTP_PORT`: (nt. 587)
- `SMTP_USER`: (Sinu email)
- `SMTP_PASS`: (Sinu parool/App Password)
- `SMTP_FROM`: (nt. "SmartBuild" <no-reply@smartbuild.ee>)

**Märkus:** Kui SMTP puudub, töötab süsteem "DRY RUN" režiimis (logib konsooli).

## Tehnoloogiad
- **Next.js 15+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Nodemailer** (Email logic)
