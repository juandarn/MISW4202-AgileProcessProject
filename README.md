# 🍽️ Recetario – Agile Project by 4201Software

> Academic project developed for the course **Agile Software Development Processes**  
> Universidad de los Andes – 2025  

---

## 📖 Project Description

**4201Software** is developing **Recetario**, a web application designed to manage **recipes, ingredients, and menus** across a restaurant chain.

In the initial version, the restaurant administrator can:
- View the list of registered recipes.
- Add, edit, or delete existing recipes.
- Access the ingredient list (name, unit, cost, calories, supplier, etc.).
- Add new ingredients or edit existing ones (if they are not used in recipes).
- Plan a **recipe preparation** for a specific number of people, displaying:
  - Calories per serving.
  - Total ingredient cost.
  - Proportional ingredient quantities.
  - Detailed preparation steps.

---

## 🚀 Product Evolution (MVP)

To prepare for an investor presentation, **4201Software** aims to evolve this prototype into a fully functional **Minimum Viable Product (MVP)** that can be used by multiple restaurants in a chain.

### 🎯 New Objectives

1. **Manage Multiple Restaurants**  
   - Register and manage multiple restaurants.  
   - Associate chefs and administrators with each location.  
   - Enable recipe sharing between restaurants.

2. **Purchase Management per Restaurant**  
   - Select a weekly menu.  
   - Calculate required ingredients and quantities based on projected dishes.  
   - Generate purchase lists and cost estimates.

3. **Data Analytics for Purchase Management**  
   - Suggest suppliers based on location, cost, quality, and availability.  
   - Provide analytics to improve ingredient sourcing decisions.

---

## 🧩 Project Technologies

| Component | Tool |
|-----------|-------|
| **Backend** | Python + Flask |
| **Frontend** | Angular |
| **Database** | SQLite |
| **Version Control** | Git |
| **Remote Repository** | GitHub |
| **Continuous Integration (CI/CD)** | GitHub Actions, Jenkins |
| **Documentation** | GitHub Wiki |
| **Project Management** | Jira |

---

## 🏗️ System Architecture

The system is divided into two main components:

- **Backend (Flask API)**  
  Provides REST endpoints to manage users, restaurants, recipes, and ingredients.  
  Uses SQLAlchemy as ORM and follows test-driven development (*TDD*) principles with `unittest`.

- **Frontend (Angular)**  
  Interactive web application allowing administrators and chefs to manage recipes and ingredients, visualize analytics, and plan weekly menus.

---

## 🧪 Testing and CI/CD

This project includes:
- **Unit and integration tests** using `unittest`.
- **Continuous integration pipeline** with **GitHub Actions**, automatically running tests on every *push* and *pull request*.
- Optional **Jenkins** integration for automated deployments.

---

## 👥 Team Members

| Full Name | GitHub Username |
|------------------|------------------|
| **Juan David Rios** | [@juandarn](https://github.com/juandarn) |
| **Laura Carretero** | [@lauths12](https://github.com/lauths12) |
| **Daniel Diaz** | [@ddi4z](https://github.com/ddi4z) |
| **Maycol Avendaño** | [@maycolan](https://github.com/maycolan) |

---

## 📅 Agile Methodology

The development process follows an **iterative agile approach** based on *Scrum*, divided into **three iterations**:

1. **Iteration 1 – Planning and Setup**
   - Define user stories and product map.
   - Set up environment, repository, and CI/CD pipelines.

2. **Iteration 2 – MVP Development**
   - Implement the Flask backend and database.
   - Integrate backend with Angular frontend.
   - Write initial unit tests.

3. **Iteration 3 – Refinement and Final Presentation**
   - Refactor and expand testing.
   - Improve UI/UX and prepare final MVP demo.

---

## 📘 Documentation

All project documentation and management artifacts are available in the **GitHub Wiki**, including:
- User stories and product roadmap.  
- Installation and deployment guides.  
- Test results and coverage reports.  
- Iteration plans and retrospectives.  

---

## 🧭 How to Run the Project

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/recetario.git
cd recetario
````

### 2️⃣ Install backend dependencies

```bash
cd backend
pip install -r requirements.txt
flask run
```

### 3️⃣ Install frontend dependencies

```bash
cd ../frontend
npm install
ng serve
```

### 4️⃣ Open the application

Visit in your browser:
👉 `http://localhost:4200`

---

## 🏁 Current Status

✅ Initial functional Flask backend.
✅ Configured unit testing with `unittest`.
✅ Continuous integration via GitHub Actions.
🔄 In progress: Angular integration and analytics module.
