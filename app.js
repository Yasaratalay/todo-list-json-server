// Elementler
const listEmployee = document.getElementById("jsonBtn");
const list = document.getElementById("employees");
const form = document.getElementById("film-form");
const deleteUser = document.getElementById("delete-user");

// Inputlar
const userName = document.querySelector("#userName");
const userDepartment = document.querySelector("#userDepartment");
const userSalary = document.querySelector("#userSalary");

class Request {
    get(url) {
        return new Promise((resolve, reject) => {
            fetch(url)
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(err => reject(err));
        })

    }

    post(url, data) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                    method: 'POST',
                    body: JSON.stringify(data),
                    headers: {
                        'Content-type': 'application/json; charset=UTF-8',
                    }
                })
                .then(response => response.json())
                .then(data => resolve(data))
                .catch(err => reject(err));
        });
    }

    delete(url) {
        return new Promise((resolve, reject) => {
            fetch(url, {
                    method: 'DELETE'
                })
                .then(response => response.json())
                .then(response => resolve(data))
                .catch(err => reject(err));
        })
    }
}

const request = new Request();

function getAllEmployee() {
    request.get("http://localhost:3000/employee")
        .then(response => setAllEmployees(response))
        .catch(err => console.error("Beklenmedik Hata"));
}

function setAllEmployees(response) {
    response.forEach(function (item) {
        list.innerHTML +=
            `
        <tr>
          <td>${item.id}</td>
          <td>${item.name}</td>
          <td>${item.department}</td>
          <td>${item.salary}</td>
          <td><a href="#" id = "delete-user" class = "btn btn-danger" data-employeeid =${item.id} >Delete</a></td>
        </tr>
        `;
    })
};

form.addEventListener("submit", function () {
    request.post("http://localhost:3000/employee", {
            name: userName.value,
            department: userDepartment.value,
            salary: userSalary.value
        })
        .then(newUser => {
            getAllEmployee();
        })
        .catch(err => console.error(err))
})

getAllEmployee();