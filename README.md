# Moura Time Tracker ⏱️

### Desafio 01: Sistema de Ponto Eletrônico

Este projeto é uma solução completa para a gestão de jornada de trabalho, desenvolvida como parte do desafio técnico do programa **Moura Tech**. O sistema permite que colaboradores realizem registros de entrada e saída (Check-in/Check-out) e oferece um painel administrativo para monitoramento e gestão.

---

## 🚀 Tecnologias Utilizadas

O projeto utiliza uma stack moderna baseada em microserviços containerizados:

### **Backend**

* **Java 17** com **Spring Boot 4.0.1**.
* **Spring Security**: Para autenticação e autorização via **JWT** (JSON Web Token).
* **Spring Data JPA**: Para persistência de dados.
* **Flyway**: Gerenciamento de migrações do banco de dados.
* **PostgreSQL**: Banco de dados relacional.
* **Lombok**: Redução de código boilerplate.
* **SpringDoc OpenAPI (Swagger)**: Documentação automatizada da API.

### **Frontend**

* **React 19** com **Vite**.
* **TanStack Query (React Query)**: Gerenciamento de estado e requisições HTTP.
* **React Router Dom**: Navegação entre páginas.
* **ApexCharts**: Visualização de dados em gráficos.
* **jsPDF & jsPDF-AutoTable**: Geração de relatórios em PDF.
* **Lucide React**: Biblioteca de ícones.
* **Sonner**: Notificações interativas.

---

## 🏗️ Arquitetura e Infraestrutura

O projeto está totalmente "dockerizado", facilitando o setup do ambiente de desenvolvimento através do **Docker Compose**.

### Serviços:

1. **time-tracker-postgres-container**: Banco de dados PostgreSQL rodando na porta `5431`.
2. **time-tracker-backend**: API REST Spring Boot rodando na porta `8080`.
3. **time-tracker-frontend**: Aplicação React servida via Nginx na porta `5173`.

---

## 🛠️ Como Executar o Projeto

### Pré-requisitos

* Docker e Docker Compose instalados.
* Git para clonar o repositório.

### Passo a Passo

1. **Clonar o repositório:**
```bash
git clone https://github.com/ViniciusCavalcanteSantos/moura-time-tracker.git
cd moura-time-tracker

```


2. **Subir os containers:**
Certifique-se de que as portas `5431`, `8080` e `5173` estão livres e execute:
```bash
docker-compose up -d

```


3. **Acessar as aplicações:**
* **Frontend**: [http://localhost:5173](https://www.google.com/search?q=http://localhost:5173)
* **Documentação da API (Swagger)**: [http://localhost:8080/swagger-ui.html](https://www.google.com/search?q=http://localhost:8080/swagger-ui.html)



---

## 📋 Funcionalidades Principal

* **Registro de Ponto**: Check-in e Check-out simplificado para colaboradores.
* **Painel Administrativo**: Gestão de usuários e visualização de jornadas.
* **Gráficos de Desempenho**: Dashboards visuais utilizando ApexCharts.
* **Relatórios**: Exportação de registros de tempo em formato PDF.

---

## 📝 Configurações Adicionais

* **Banco de Dados**: As migrações são executadas automaticamente pelo Flyway ao iniciar o serviço de backend.
* **Segurança**: O backend possui proteção CSRF desabilitada para facilitar a comunicação stateless e utiliza JWT para validação de sessões.

---

**Desenvolvido para o programa Moura Tech.**
