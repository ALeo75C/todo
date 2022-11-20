import { useState, useEffect } from "react";
import * as dayjs from "dayjs";

import { db, storage } from "./firebase-config";
import { ref, get, set } from "firebase/database";
import {
  ref as sRef,
  uploadBytes,
  listAll,
  getDownloadURL, deleteObject 
} from "firebase/storage";

import "./App.css";

import Card from "./components/Card";
import TodoPage from "./components/TodoPage";
import TodoEdit from "./components/TodoEdit";

function App(app) {
  const [todoList, setTodoList] = useState();
  const [showTodoPageId, setShowTodoPageId] = useState();
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState([]);

  /** При загрузке страницы один раз происходит запрос в базу данных */
  useEffect(() => {
    get(ref(db))
      .then((snapshot) => {
        if (snapshot.exists()) {
          setTodoList(snapshot.val());
          setLoading(false);
        } else {
          setTodoList([]);
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  /**
   * Функция загрузки файлов в firebase
   * @param {array} files список фалов 
   * @param {number} id id задачи, к которой относятся файлы
   */
  const fileUpload = (files, id) => {
    for (var i = 0; i < files.length; i++) {
      const file = files[i];
      const fileRef = sRef(storage, `files/${id}/${file.name}`);
      uploadBytes(fileRef, file).then(() => {
        console.log("Файл загружен");
      });
    }
  };

  /**
   * Функция создает новую задачу в базе данных и обновляет данные в state
   * @param {Object} data данные о создаваемой задаче
   * @param {Number} objectId id задачи из базы данных (ключ объекта todoList)
   * @param {Array} files файлы, которые следует загруить в firebase
   */
  const createTask = (data, objectId = null, files = null) => {
    const { title, deadline, description } = data;
    const lastItemId = Object.keys(todoList)[Object.keys(todoList).length - 1];
    const id = Number(lastItemId) + 1;

    if (files) {
      fileUpload(files, id);
    }

    const newData = todoList;
    newData[id] = {
      title,
      deadline,
      description,
      status: "process",
      filesPath: `files/${id}/`,
    };
    set(ref(db), newData)
      .then(
        get(ref(db))
          .then((snapshot) => {
            if (snapshot.exists()) {
              setTodoList(snapshot.val());
              setShowTodoPageId();
              console.log("Новая задача создана");
            } else {
              console.log("No data available");
            }
          })
          .catch((error) => {
            console.error(error);
          })
      )
      .catch((error) => {
        console.error(error);
      });
  };

   /**
   * Функция редактирует задачу в базе данных и обновляет данные в state
   * @param {Object} data данные о создаваемой задаче
   * @param {Number} id id задачи из базы данных (ключ объекта todoList)
   * @param {Array} files файлы, которые следует загруить в firebase
   */
  const changeTask = (data, id, files = null) => {
    if (files) {
      fileUpload(files, id);
    }
    const newData = todoList;
    newData[id] = data;
    newData[id].filesPath = `files/${id}/`;
    set(ref(db), newData)
      .then(
        get(ref(db)).then((snapshot) => {
          if (snapshot.exists()) {
            setTodoList(snapshot.val());
            setShowTodoPageId();
            console.log("Задача успешно изменена");
          } else {
            console.log("No data available");
          }
        })
      )
      .catch((error) => {
        console.error(error);
      });
    console.log(newData);
  };

   /**
   * Функция удаляет задачу в базе данных и обновляет данные в state
   * @param {Number} id id задачи из базы данных (ключ объекта todoList)
   */
  const removeTodo = (id) => {
    const data = todoList;
    delete data[id];
    setLoading(true);
    set(ref(db), data)
      .then(
        get(ref(db)).then((snapshot) => {
          if (snapshot.exists()) {
            setTodoList(snapshot.val());
            setShowTodoPageId();
            setLoading(false);
            console.log("Задача успешно удалена");
          } else {
            console.log("No data available");
          }
        })
      )
      .catch((error) => {
        console.error(error);
      });
  };

   /**
   * Функция вызывает changeTask с обновленным статусом
   * @param {Number} id id задачи из базы данных (ключ объекта todoList)
   * @param {String} status новый статус (pocessed, finished, overdue)
   */
  const changeTaskStatus = (id, status) => {
    const { deadline, description, title } = todoList[id];
    changeTask(
      {
        deadline,
        description,
        status,
        title,
      },
      id
    );
  };

  /**
   * Изменяет setShowTodoPageId и загружет файлы, связанные с задачей
   * @param {Number} id id задачи в БД 
   */
  const openTodo = (id) => {
    if (todoList[id]) {
      const path = todoList[id].filesPath;
      setLinks([]);
      if (path) {
        listAll(sRef(storage, path)).then((res) => {
          res.items.forEach((item, i) => {
            getDownloadURL(item).then((url) => {
              setLinks((prew) => [...prew, url]);
              return true;
            });
          });
        });
      }
    }
    setShowTodoPageId(id);
  };

  /**
   * Проверяет актуальность задачи, если задача просрочена меняет ее статус на overdue
   * @param {String} deadline дата в формате YYYY-MM-DD
   * @param {Number} id id проверемой задачи
   */
  const deadlineMonitor = (deadline, id) => {
    let now = dayjs(new Date()).format("YYYY-MM-DD");
    now = now.split("-");
    deadline = deadline.split("-");
    if (now[2] - deadline[2] > 0 && todoList[id].status != "overdue") {
      changeTaskStatus(id, "overdue");
    }
  };

  /**
   * Сборщик карточек с задачами
   * @returns {array} массив html объектов
   */
  const renderTaskCards = () => {
    let cardsItems = [
      <Card
        key={"emptyCard"}
        status={"empty"}
        onClick={() => setShowTodoPageId("new")}
      />,
    ];
    if (todoList) {
      var keys = Object.keys(todoList);
      for (let i = keys.length - 1; i > -1; i--) {
        deadlineMonitor(todoList[keys[i]].deadline, keys[i]);
  
        cardsItems.push(
          <Card
            key={"card" + keys[i]}
            id={keys[i]}
            title={todoList[keys[i]].title}
            deadline={todoList[keys[i]].deadline}
            status={todoList[keys[i]].status}
            changeTaskStatus={changeTaskStatus}
            removeTodo={removeTodo}
            onClick={openTodo}
          />
        );
      }
    }
    return <div className="cardsCollection">{cardsItems}</div>
     
  }

  /**
   * Вызов react компонента, отрисовывающего блок просмотра задачи или создания новой
   */
  const renderTodoPage = () => {
    let toDo;
    if (typeof showTodoPageId === "string") {
      toDo = (
        <TodoEdit
          data={{ title: "", deadline: "", description: "" }}
          close={() => setShowTodoPageId()}
          handleSubmit={createTask}
        />
      );
    } else {
      toDo =
        showTodoPageId || showTodoPageId === 0 ? (
          <TodoPage
            id={showTodoPageId}
            data={todoList[showTodoPageId]}
            links={links}
            changeTask={changeTask}
            remove={removeTodo}
            close={() => setShowTodoPageId()}
          />
        ) : (
          ""
        );
    }
    return toDo;
  };

  return loading ? (
    <p>....loading</p>
  ) : (
    <div className="ToDoApp">
      {renderTaskCards()}
      {renderTodoPage()}
    </div>
  );
}

export default App;
