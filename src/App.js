import { useState, useEffect } from "react";
import * as dayjs from "dayjs";

import { db, storage } from "./firebase-config";
import { ref, get, set } from "firebase/database";
import {
  ref as sRef,
  uploadBytes,
  listAll,
  getDownloadURL,
} from "firebase/storage";

import {taskStatus} from './_taskStatus'
import "./styles/css/App.css";

import Card from "./components/Card";
import DetailsBlock from "./components/DetailsBlock";
import DetailsEditor from "./components/DetailsEditor";

function App(app) {
  const [todoList, setTodoList] = useState();
  const [selectedCardId, setSelectedCardId] = useState();
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
   * @param {Array} files файлы, которые следует загруить в firebase
   */
  const createTask = (data, files = null) => {
    const { title, deadline, description } = data;
    const lastItemId = Object.keys(todoList)[Object.keys(todoList).length - 1];
    const id = lastItemId ? Number(lastItemId) + 1 : 0;

    if (files) {
      fileUpload(files, id);
    }

    const newData = todoList;
    newData[id] = {
      title,
      deadline,
      description,
      isCompleted: false,
      filesPath: `files/${id}/`,
    };
    set(ref(db), newData)
      .then(
        get(ref(db))
          .then((snapshot) => {
            if (snapshot.exists()) {
              setTodoList(snapshot.val());
              setSelectedCardId();
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

    if (!("isCompleted" in data)) {
      data.isCompleted = todoList[id].isCompleted;
    }
    if (!("filesPath" in data)) {
      data.filesPath = todoList[id].filesPath;
    }
    newData[id] = data;
    
    set(ref(db), newData)
      .then(
        get(ref(db)).then((snapshot) => {
          if (snapshot.exists()) {
            setTodoList(snapshot.val());
            setSelectedCardId();
            console.log("Задача успешно изменена");
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
   * Функция удаляет задачу в базе данных и обновляет данные в state
   * @param {Number} id id задачи из базы данных (ключ объекта todoList)
   */
  const removeTodo = (id) => {
    const data = todoList;
    delete data[id];
    setLoading(true)
    set(ref(db), data)
      .then(
        get(ref(db)).then((snapshot) => {
          if (snapshot.exists()) {
            setTodoList(snapshot.val());
            setSelectedCardId(undefined);
            setLoading(false)

            console.log("Задача успешно удалена");
          } else {
            setSelectedCardId(undefined);
            setTodoList([])
            setLoading(false)

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
   */
  const changeTaskStatus = (id) => {
    const { deadline, description, title, isCompleted, filesPath } = todoList[id];

    changeTask(
      {
        deadline,
        description,
        isCompleted: !isCompleted,
        filesPath,
        title,
      },
      id
    );
  };


  /**
   * Изменяет setSelectedCardId и загружет файлы, связанные с задачей
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
    setSelectedCardId(id);
  };

  /**
   * Проверяет актуальность задачи
   * @param {Number} id id проверемой задачи
   */
  const checkIsOverdue = (id) => {
    let now = dayjs(new Date())
    return (dayjs(todoList[id].deadline).diff(now) < 0  && !todoList[id].isCompleted)
  };

  /**
   * Сборщик карточек с задачами
   * @returns {array} массив html объектов
   */
  const renderTaskCards = () => {
    let cardsItems = [
      <Card
        key={"emptyCard"}
        onClick={() => setSelectedCardId("new")}
      />,
    ];
    if (todoList) {
      var keys = Object.keys(todoList);
      for (let i = keys.length - 1; i > -1; i--) {
        const isOverdue = checkIsOverdue(keys[i]);
        const status = isOverdue ? taskStatus.overdue : (todoList[keys[i]].isCompleted ? taskStatus.finished : taskStatus.process)

        cardsItems.push(
          <Card
            key={"card" + keys[i]}
            id={keys[i]}
            title={todoList[keys[i]].title}
            deadline={todoList[keys[i]].deadline}
            status={status}
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
  const renderCardDetails = () => {
    let cardDetails;
    if (selectedCardId === "new") {
      cardDetails = (
        <DetailsEditor
          data={{ title: "", deadline: "", description: "" }}
          close={() => setSelectedCardId()}
          handleSubmit={createTask}
        />
      );
    } else {
      cardDetails =
        selectedCardId || selectedCardId === 0 ? (
          <DetailsBlock
            id={selectedCardId}
            data={todoList[selectedCardId]}
            links={links}
            changeTask={changeTask}
            changeTaskStatus={changeTaskStatus}
            remove={removeTodo}
            close={() => setSelectedCardId()}
          />
        ) : (
          ""
        );
    }
    return cardDetails;
  };

  /** Рендер приложения */
  return loading ? (
    <p>....loading</p>
  ) : (
    <div className="ToDoApp">
      {renderTaskCards()}
      {renderCardDetails()}
    </div>
  );
}

export default App;
