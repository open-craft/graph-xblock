# GraphXBlock

An Open edX XBlock that embeds a **Desmos Graphing Calculator** so learners can plot mathematical expressions. Authors can optionally seed a default equation and configure the Desmos API key.

---

## Features

- Desmos Graphing Calculator embedded in course content  
- Optional **seed equation** shown on load  
- Configurable **Desmos API key**  
- Works in LMS (student view), Studio preview (author/preview), and the XBlock SDK Workbench

---

## Installation

> Install in the **same Python environment** as your LMS/CMS (or the XBlock SDK).

```bash
pip install -e .
```

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

The view passes data to JS via:
```python
frag.initialize_js("GraphXBlock", {
    "default_expression": self.seed_equation
})
```

---

### Tutor (optional)

```bash
# Install into both containers
tutor dev run lms pip install -e /path/to/graphxblock
tutor dev run cms pip install -e /path/to/graphxblock
tutor dev restart lms cms
```

