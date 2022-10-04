/* eslint-disable jsx-a11y/control-has-associated-label */
import React, {
  useContext,
  useEffect,
  useState,
} from 'react';
import classNames from 'classnames';
import { TodoList } from './components/TodoList';
import {
  getTodos,
  deleteTodo,
  patchTodo,
} from './api/todos';
import { Todo } from './types/Todo';
import { ErrorNotification } from './components/ErrorNotification';
import { SortType } from './types/filterBy';
import { NewTodoField } from './components/NewTodoField';
import { AuthContext } from './components/Auth/AuthContext';
import { ActiveTodos } from './components/ActiveTodos';

function filterTodos(
  todos: Todo[],
  sortType: SortType,
) {
  const visibleTodos = [...todos];

  switch (sortType) {
    case SortType.Active:
      return visibleTodos.filter(todo => !todo.completed);

    case SortType.Completed:
      return visibleTodos.filter(todo => todo.completed);
    default:
      return visibleTodos;
  }
}

export const App: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const user = useContext(AuthContext);

  const [todos, setTodos] = useState<Todo[]>([]);
  const [sortType, setSortType] = useState<SortType>(SortType.All);
  const [selectedLink, setSelectedLink] = useState<string>('All');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [activeItems, setActiveItems] = useState<number>(0);
  const [visibleLoader, setVisibleLoader] = useState(false);
  const [
    visibleClearCompleted,
    setVisibleClearCompleted,
  ] = useState<number>(0);

  let userId = 0;

  if (user?.id) {
    userId = user.id;
  }

  useEffect(() => {
    getTodos(userId)
      .then(todosFromServer => {
        setTodos(todosFromServer);
        setActiveItems(todosFromServer.length);
      })
      .catch(() => setErrorMessage('Unable to update todos'));
  }, []);

  const addNewTodo = (todo: Todo) => {
    setTodos(prevTodos => [todo, ...prevTodos]);
    setActiveItems(prevItems => prevItems + 1);
  };

  const todoDelete = (todo: Todo) => {
    deleteTodo(todo.id)
      .then(() => {
        setVisibleLoader(false);
      })
      .catch(() => {
        setErrorMessage('Unable to delete a todo');
      });

    setTodos(
      todos.filter(userTodo => todo.id !== userTodo.id),
    );
    setActiveItems(prevItems => prevItems - 1);
  };

  const deleteCompletedTodos = () => {
    todos.forEach(todoFromServer => {
      if (todoFromServer.completed) {
        setTodos(
          todos.filter(todo => todo.id !== todoFromServer.id),
        );
      }
    });
  };

  const updateCompleteTodo = (todo: Todo) => {
    setVisibleLoader(true);

    patchTodo(todo.id, { completed: !todo.completed })
      .then(() => setVisibleLoader(false));

    const newTodos = [...todos];
    const todoIndex = todos.findIndex(el => el.id === todo.id);

    newTodos[todoIndex].completed = !todo.completed;

    if (!todo.completed) {
      setVisibleClearCompleted(prev => {
        let temp = prev;

        temp += 1;

        return temp;
      });
    } else {
      setVisibleClearCompleted(prev => {
        let temp = prev;

        temp -= 1;

        return temp;
      });
    }

    setTodos(newTodos);
  };

  const visibleTodos = filterTodos(todos, sortType);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          <button
            data-cy="ToggleAllButton"
            type="button"
            className="todoapp__toggle-all active"
          />

          <NewTodoField
            onAdd={addNewTodo}
            setErrorMessage={setErrorMessage}
            setVisibleLoader={setVisibleLoader}
            visibleLoader={visibleLoader}
          />
        </header>

        {todos && (
          <>
            <TodoList
              todos={visibleTodos}
              deleteTodo={todoDelete}
              visibleLoader={visibleLoader}
              setVisibleLoader={setVisibleLoader}
              updateCompleteTodo={updateCompleteTodo}
            />

            <footer className="todoapp__footer" data-cy="Footer">
              <ActiveTodos activeItems={activeItems} />

              <nav className="filter" data-cy="Filter">
                <a
                  data-cy="FilterLinkAll"
                  href="#/"
                  className={classNames(
                    'filter__link',
                    { selected: selectedLink === 'All' },
                  )}
                  onClick={() => {
                    setSortType(SortType.All);
                    setSelectedLink('All');
                  }}
                >
                  All
                </a>

                <a
                  data-cy="FilterLinkActive"
                  href="#/active"
                  className={classNames(
                    'filter__link',
                    { selected: selectedLink === 'Active' },
                  )}
                  onClick={() => {
                    setSortType(SortType.Active);
                    setSelectedLink('Active');
                  }}
                >
                  Active
                </a>
                <a
                  data-cy="FilterLinkCompleted"
                  href="#/completed"
                  className={classNames(
                    'filter__link',
                    { selected: selectedLink === 'Completed' },
                  )}
                  onClick={() => {
                    setSortType(SortType.Completed);
                    setSelectedLink('Completed');
                  }}
                >
                  Completed
                </a>
              </nav>

              {visibleClearCompleted > 0 && (
                <button
                  data-cy="ClearCompletedButton"
                  type="button"
                  className="todoapp__clear-completed"
                  onClick={deleteCompletedTodos}
                >
                  Clear completed
                </button>
              )}
            </footer>
          </>
        )}
      </div>

      {errorMessage && (
        <ErrorNotification
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      )}
    </div>
  );
};
