# GraphXBlock

An Open edX XBlock that embeds a **Desmos Graphing Calculator** so learners can plot mathematical expressions. Authors can optionally seed a default equation and configure the Desmos API key.

---

## Features

- Desmos Graphing Calculator embedded in course content
- Optional **seed equation** shown on load
- Configurable **Desmos API key**
- Works in LMS (student view), Studio preview (author/preview), and the XBlock SDK Workbench
- Add seed equation to the XBlock
- Hide seed equation from the expression list.
- Change the style of the line and add labels to axis.

---

## Enabling in Studio

1. Install the package in **both** LMS and CMS environments.
2. Restart services (e.g., with Tutor: `tutor dev restart lms cms`).
3. In **Studio → Course → Advanced Settings**, add the entry point key to `advanced_modules`, i.e.:
   ```json
   ["graphxblock"]
   ```

---

## Usage

Add **GraphXBlock** to a unit (Components → Advanced). Configure:

- **Desmos API Key** (`api_key`, `Scope.content`)  
  Use your own key or the Desmos demo key.
- **Seed Equation** (`seed_equation`, `Scope.content`)  
  Example: `y = x^2`

The block constructs the script URL like:
```
https://www.desmos.com/api/v1.9/calculator.js?apiKey=<api_key>
```

---

### Developing this XBlock on Tutor

Clone this repo under:

```bash
{tutor config printroot}/env/build/openedx/requirements
```

:: Note If the directory doesn't exists please create it.

Add a `private.txt` under the `requirements` directory.
Add

```bash
-e ./graphxblock
```

We need to mount the XBlock

```bash
tutor mounts add ./graphxblock
```

Stop all containers

```bash
tutor dev stop
```

Re-build the image

```bash
tutor images build openedx-dev
```

Restart the containers

```bash
tutor dev start -d
```
Once this is done the XBlock should be installed in LMS and CMS.
