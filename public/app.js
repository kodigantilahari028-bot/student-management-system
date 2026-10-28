const form = document.getElementById('student-form');
const list = document.getElementById('student-list');
const message = document.getElementById('message');

async function loadStudents() {
  try {
    const response = await fetch('/api/students');

    if (!response.ok) {
      throw new Error('Could not load students');
    }

    const students = await response.json();
    list.replaceChildren();

    if (students.length === 0) {
      list.textContent = 'No student records yet. Add a student above.';
      return;
    }

    students.forEach(student => {
      const item = document.createElement('div');
      item.className = 'student';

      const details = document.createElement('div');
      const name = document.createElement('strong');
      name.textContent = student.name;

      const info = document.createElement('p');
      info.textContent =
        'Age: ' + student.age + ' | Course: ' + student.course;

      details.append(name, info);

      const button = document.createElement('button');
      button.className = 'delete';
      button.textContent = 'Delete';

      button.addEventListener('click', async () => {
        const result = await fetch('/api/students/' + student.id, {
          method: 'DELETE'
        });

        if (result.ok) {
          message.textContent = 'Student deleted.';
          loadStudents();
        } else {
          message.textContent = 'Could not delete student.';
        }
      });

      item.append(details, button);
      list.appendChild(item);
    });
  } catch {
    list.textContent =
      'Unable to load records. Please start the Node.js server.';
  }
}

form.addEventListener('submit', async event => {
  event.preventDefault();
  message.textContent = '';

  const student = {
    name: form.elements.name.value.trim(),
    age: Number(form.elements.age.value),
    course: form.elements.course.value.trim()
  };

  try {
    const response = await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(student)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Unable to add student');
    }

    form.reset();
    message.textContent = 'Student added successfully!';
    await loadStudents();
  } catch (error) {
    message.textContent = error.message || 'Something went wrong.';
  }
});

loadStudents();
