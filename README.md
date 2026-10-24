# सखीसेतू (SakhiSetu) – महिला बचत गट व्यवस्थापन प्रणाली
**Women Self-Help Group (SHG) Management & Digital Empowerment Platform**  
*महाराष्ट्र राज्य ग्रामीण जीवनोन्नती अभियान (UMED / MSRLM) & डिजिटल भारत प्रेरित*

---

## ⚡ जलद चाचणीसाठी डेमो खाती (Demo Login Credentials)

लॉगिन पेजवर **1-क्लिक डेमो लॉगिन** बटणे उपलब्ध आहेत. किंवा खालील तपशील वापरून थेट लॉगिन करू शकता:

| भूमिका (Role) | नाव (Name) | वापरकर्ता नाव (Username) | मोबाईल (Mobile) | पासवर्ड (Password) | रिडायरेक्शन डॅशबोर्ड |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 👩🏽‍💼 **समूह सखी (CRP)** | **नागीण संग्राम मठदेवरू** | `crp001` *(किंवा `crp`)* | `8806594798` | `Crp@123` | **CRP Dashboard** |
| 👨🏽‍💼 **प्रखंड व्यवस्थापक (Block Manager)** | **स्वामी महेश संग्राम** | `blockmanager001` *(किंवा `bm`)* | `9881123456` | `BL@123` | **Block Manager Dashboard** |
| 🏛️ **जिल्हा प्रशासक (Admin)** | **विजयमाला विठ्ठलराव वाघमारे** | `admin001` *(किंवा `admin`)* | `9422001122` | `Admin@123` | **Admin Dashboard** |

---

## 🏛️ प्रणाली रचना व अधिकार स्तर (System Hierarchy)

```
ADMIN (विजयमाला विठ्ठलराव वाघमारे - राज्य/जिल्हा नियंत्रण)
  │
  └── DISTRICT (लातूर, पुणे, सोलापूर)
        │
        └── BLOCK / TALUKA (जळकोट, हवेली, बारामती)
              │
              └── BLOCK MANAGER (स्वामी महेश संग्राम - तालुका संनियंत्रण)
                    │
                    └── CRP (नागीण संग्राम मठदेवरू - क्षेत्रीय कार्य)
                          │
                          └── SHG (बचत गट) & महिला सभासद
```

---

## 🌟 प्रमुख वैशिष्ट्ये (Key Features)

1. **समूह सखी (CRP) क्षेत्रीय कार्य प्रणाली:**
   - बचत गट नोंदणी व व्यवस्थापन (SHG Management)
   - महिला सभासद व कुटुंब प्रोफाईल (Member Profiles with BPL & Livelihood Data)
   - १-क्लिक त्वरित बचत संकलन व डिजिटल पावती (Quick Savings with Offline Sync)
   - अंतर्गत कर्ज व बँक CCL लिंकेज हप्ता व्यवस्थापन (Loans & EMI Tracking)
   - मासिक सभा हजेरी व मराठी ठराव नोंद (Meetings & Attendance)
   - GPS जिओ-टॅगिंगसह क्षेत्रीय भेटी (Field Visits with Live GPS)
   - लखपती दीदी उपजीविका उपक्रम (Livelihood & Micro-Enterprise Tracking)
   - शासकीय योजना अर्ज नोंदणी (Govt Schemes Integration)
   - डिजिटल पासबुक, संकलन पत्रक व Excel/CSV रिपोर्ट निर्यात (Reports & Exports)

2. **प्रखंड व्यवस्थापक (Block Manager Supervision):**
   - कडक अधिकार नियंत्रण (Strict Scoped Access: CRPs in assigned Block only)
   - रिअल-टाइम ऑनलाइन सत्र ट्रॅकिंग (Live Active CRPs)
   - समूह सखींची कामगिरी मूल्यमापन व अहवाल
   - ब्लॉक स्तरावरील बचत व CCL कर्ज आढावा

3. **जिल्हा व राज्य प्रशासक (Admin Control):**
   - संपूर्ण महाराष्ट्र राज्य व जिल्हा स्तरीय व्यवस्थापन
   - प्रखंड व्यवस्थापक नियुक्ती व संनियंत्रण
   - सिस्टीम ऑडिट व सुरक्षितता ट्रेल (Tamper-evident Security Logs)

4. **ग्रामीण महिलांसाठी विशेष सुविधा:**
   - AI व्हॉईस असिस्टंट (मराठीत बोलून माहिती विचारणे व ऑडिओ उत्तर)
   - टेक्स्ट-टू-स्पीच (Text-to-Speech) व्हॉईस रीडआउट
   - १००% मोबाईल रिस्पॉन्सिव्ह डिझाईन
   - ऑफलाइन काम व ऑनलाइन आल्यावर स्वयंचलित सिंक्रोनायझेशन

---

## 🚀 प्रकल्प स्थानिक पातळीवर चालवणे (Local Development)

```bash
# 1. सर्व आवश्यक पॅकेजेस इन्स्टॉल करा
npm install

# 2. डेव्हलपमेंट सर्व्हर सुरू करा
npm run dev
```

ब्राउझरमध्ये उघडा: **http://localhost:3000**

---

## 🧪 पडताळणी व टेस्ट सुट (Verification & Tests)

प्रकल्पातील कोडची गुणवत्ता आणि अधिकार नियंत्रण तपासण्यासाठी खालील कमांड्स उपलब्ध आहेत:

```bash
# लिंटिंग तपासणी (0 Errors, 0 Warnings)
npm run lint

# प्रॉडक्शन बिल्ड पडताळणी
npm run build

# सुरक्षा व अधिकार नियंत्रण टेस्ट सूट चालवणे
npm test

# संपूर्ण पडताळणी एकाच वेळी (Lint + Build)
npm run check
```

---

## 🚢 प्रॉडक्शन डिप्लॉयमेंट मार्गदर्शक (Deployment Guide)

### पर्याय १: डॉकर द्वारे डिप्लॉयमेंट (Docker Deployment - Recommended)

प्रकल्पात मल्टि-स्टेज, सुरक्षित `Dockerfile` आणि `docker-compose.yml` तयार केले आहे:

```bash
# १-क्लिक डॉकर कंटेनर सुरू करा:
docker compose up -d --build

# कंटेनर स्थिती तपासा:
docker compose ps

# लॉग्स तपासा:
docker compose logs -f
```

कंटेनर **http://localhost:3000** वर लाईव्ह होईल.

### पर्याय २: Vercel / Netlify क्लाउड डिप्लॉयमेंट

1. हा GitHub रिपॉझिटरी Vercel किंवा Netlify वर कनेक्ट करा.
2. फ्रेमवर्क प्रीसेट: **Next.js**
3. बिल्ड कमांड: `npm run build`
4. आउटपुट डिरेक्टरी: `.next`
5. डिप्लॉय करा (1-क्लिक स्वयंचलित डिप्लॉयमेंट).

### पर्याय ३: Node.js Standalone सर्व्हर (VPS / AWS / Ubuntu)

```bash
# बिल्ड तयार करा
npm run build

# स्टँडअलोन सर्व्हर डिरेक्टरीमध्ये जा
cd .next/standalone

# सार्वजनिक फाइल्स कॉपी करा (प्रथमच)
cp -r ../../public ./public
cp -r ../static ./.next/static

# सर्व्हर सुरू करा
node server.js
```

---

## 📡 API एंडपॉइंट्स (API Reference)

| पद्धत (Method) | एंडपॉइंट (Endpoint) | वर्णन (Description) | अधिकार स्तर (Access) |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | सिस्टीम हेल्थ व अपटाइम तपासणी | Public |
| `GET` | `/api/crp` | समूह सखी यादी (अधिकारानुसार फिल्टर) | Admin, Block Manager, CRP |
| `POST` | `/api/crp` | नवीन समूह सखी नोंदणी | Admin, Block Manager |
| `GET` | `/api/crp/[id]` | विशिष्ट CRP तपशील (Strict 403) | Scoped Access |
| `PUT` | `/api/crp/[id]` | CRP माहिती अद्ययावत करणे | Scoped Access |
| `DELETE` | `/api/crp/[id]` | CRP नोंद हटवणे | Admin, Block Manager |

---

## 🔒 सुरक्षा व नियम (Security & Access Control)

- **रोल-बेस्ड आयसोलेशन:** प्रखंड व्यवस्थापकाला केवळ त्यांच्याच तालुक्यातील समूह सखींचा डेटा दिसतो. इतर ब्लॉकचा डेटा पाहण्याचा प्रयत्न केल्यास थेट `403 Forbidden` रिस्पॉन्स दिला जातो.
- **संवेदनशील डेटा संरक्षण:** API रिस्पॉन्समध्ये कधीही `passwordHash` पाठवला जात नाही.
- **ऑडिट ट्रेल:** प्रत्येक महत्त्वाची कृती (Login, Logout, Add/Update/Delete) IP पत्ता आणि वेळेसह नोंदवली जाते.
