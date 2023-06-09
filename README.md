В этой статье мы изучим тему построения правильной архитектуры приложения. На примере небольшого проекта мы разберем основные принципы построения более сложных приложений.

Материал будет полезен тем, кто никогда не работал над крупными проектами или испытывал сложности в формировании архитектуры таких проектов. Полученные знания помогут студентам, которые приступают к работе над первым проектом.

Примеры в статье будут на JavaScript, но код в ней максимально простой. Мы не будем описывать реализацию большинства функций, так как нас будут интересовать лишь их интерфейсы.

## Почему это важно

Многие начинающие разработчики сталкиваются с проблемой построения архитектуры. Какие выделить модули? Какие функции должны быть? Как эти функции должны взаимодействовать между собой? Если вы единственный разработчик в команде и создаете новое приложение, то найти ответы на эти вопросы будет сложно.

Проблема в том, что практически нигде не учат строить архитектуру. Обычно изучение языка программирования заключается в изучении синтаксиса. В уроках часто используются небольшие конструкции для практического закрепления материала. Но понять на таких примерах, как строить архитектуру сложного приложения, очень непросто.

Если вы джун и работаете в команде, у вас есть шанс познакомиться с подходами построения архитектуры благодаря код-ревью и наставлениям более опытных разработчиков. Но даже в этом вас может ждать неудача, так как во многих компаниях приносят в жертву качество кода и архитектуру ради скорости разработки.

Если вы не в команде, вам остается самому разбираться во всем — создавать приложение с нуля. Возможно, вы уже пытались это делать и сталкивались с тем, что код превращался в нечто крайне сложное и непонятное. Автор этой статьи столкнулся с такой же ситуацией.

Обычно в таких случаях работа над проектом превращается в абсолютный кошмар — код становится [спагетти-кодом](https://ru.wikipedia.org/wiki/%D0%A1%D0%BF%D0%B0%D0%B3%D0%B5%D1%82%D1%82%D0%B8-%D0%BA%D0%BE%D0%B4).

Чтобы приступить к доработкам проекта, приходится подолгу сидеть, чтобы вникнуть в работу. А через несколько несколько дней отдыха вся информация вылетает из головы, и приходится заново все изучать. При работе над таким проектом сильно падает мотивация.

## Проект

Проект, который мы будет создавать в приложении, — это консольная утилита, которая будет спрашивать у пользователя путь к файлу и выводить данные файла в виде объекта. Утилита будет уметь работать с разными форматами файлов. Для каждого формата будет отдельный исполняемый файл. Мы выделим общую логику в отдельный модуль. Эта общая логика будет использоваться в каждом отдельном формате. Всего будет два формата: YML и JSON.

## Модули

Перед разработкой проекта мы должны обсудить одну важную тему — библиотеки и исполняемые файлы. Многие студенты не до конца понимают, что это и как оно устроено.

Многие программы устроены как библиотеки. Это модули, которые мы можем подключить в любое другое приложение, например, JQuery, lodash и так далее.

**Исполняемые файлы** — это уже приложения, которые запускают код. Такие приложения не являются подключаемыми модулями. И несмотря на то, что нам нужно создать исполняемое приложение, мы создадим библиотеку, так как ее легче поддерживать и дорабатывать.

Представим, что в ходе работы над проектом мы решили добавить тесты. Если изначально разрабатывать приложение как библиотеку, то его легко импортировать в тесты. 

Или мы разрабатываем приложение для командной строки и решаем, что приложение можно еще использовать в браузере. В таком случае библиотека будет работать, а исполняемый файл — нет.

В итоге мы всегда должны стараться разрабатывать в первую очередь библиотеку, и уже ее подключать в исполняемый файл и в нем запускать код.

Пример модуля библиотеки **app.js**:

```javascript
// файл библиотеки
const app = () => {
  // ...
};
```

И ее исполняемый файл:

```javascript
#!/usr/bin/env node

import app from './app.js';

app();
```

Разделить исполняемый код и код библиотеки довольно легко. Нам нужно выделить основную функцию приложения, которая будет импортироваться в исполняемый файл и там вызываться. Такой подход даст преимущество. Например, в тестах можно легко проверять работу своего кода, просто импортировав в них эту функцию:

```javascript
import app from './app.js';

it('test', () => {
  expect(app()).toBeTruthy();
});
```

## Выделяем общую логику

Наше приложение будет спрашивать у пользователя путь к файлу и затем выводить содержимое. После вывода содержимого приложение будет повторять запрос файла. Если пользователь ничего не ввел, приложение завершает работу.

Опишем алгоритм приложения:

1. Запрашиваем путь к файлу
1. Читаем данные из файла
1. Парсим данные
1. Выводим результат
1. Повторяем первый шаг

Важно выделить логические шаги нашего приложения. На их основе будут строиться модули приложения. К сожалению, даже на этом этапе можно допустить ошибку. Например, новички часто совмещают некоторые шаги и получается:

1. Запрашиваем путь к файлу
1. Получаем распарсенные данные из файлов
1. Выводим результат

Позже мы разберем, почему это неверно.

Теперь мы можем написать код основной функции:

```javascript
const app = () => {
  // Цикл повторяется пока не будет выполнено условие выхода
  while (true) {
    const filePath = getFilePath();
    // Условие выхода из цикла и всей функции
    if (!filePath) {
      return;
    }
    const content = getFileContent(filePath);
    const result = parse(content, format);
    console.log(result);
  }
};
```

Код достаточно простой. Такой код удобно читать, и сразу видно общую логику. Код легко отлаживать. Можно добавить логирование на любом этапе и проверить промежуточные результаты:

```javascript
const app = () => {
  while (true) {
    const filePath = getFilePath();
    console.log('filePath: ', filePath);

    if (!filePath) {
      return;
    }

    const content = getFileContent(filePath);
    console.log('content: ', content);

    const result = parse(content, format);
    console.log(result);
  }
};
```

Такой код еще называют **пайплайном** — цепочка функций, которая вызывается друг за другом. Обязательно [посмотрите эту статью](https://ru.hexlet.io/blog/posts/sovershennyy-kod-proektirovanie-funktsiy).

## Правильные интерфейсы

Мы уже описали общую логику. Она задала некоторую модульность. Такой подход не всегда работает. Иногда мы не будем видеть общей картины. В таком случае нужно начинать с малого — создать функции, которые формируют абстракции. Например, мы точно знаем, что должны прочитать файл — это хорошая причина создать функцию чтения файла.

Прежде чем двинуться дальше, опишу, как должны работать функции:

* Функция `getFilePath()` получает информацию от пользователя 
* Функция `getFileContent()` читает файл и возвращает данные из этого файла. Эта функция принимает путь к файлу
* Функция `parse()` парсит данные из файла в объекты, которые поддерживает язык программирования

Самый популярный формат данных в JavaScript — это JSON:

```javascript
const content = '{"name":"Ivan","age":"18"}';
const user = JSON.parse(content);
console.log(user.name); // => Ivan
console.log(user.age); // => 18
```

Есть и другие форматы данных. Для них используются разные инструменты парсинга. Сейчас это нам не важно. Нам нужно лишь понимать, что наша задача — это получить объект или массив из строки, которая хранится в файле.

Чтение файла и парсинг данных — это разные операции, потому что данные для парсинга могут приходить из разных источников.

Представим, что вместо чтения файлов мы получаем данные по сети. Меняет ли это как-то парсинг? Нет. Но если внутри парсера будет идти работа с файлами, то это сильно затруднит работу. 

Некоторые студенты в этот момент сопротивляются и задаются вопросом: при чем тут работа с сетью? Почему мы должны учитывать, что данные должны приходить из других источников, когда по заданию этого не требуется? Это очень хороший вопрос и здесь кроется ключевой момент.

Способ построения правильной архитектуры во многом закладывается следующим принципом: каждый модуль должен быть максимально изолированным. Это значит, что мы должны создавать модули и функции, которые могут работать автономно и максимально изолированно друг от друга. Когда мы находимся внутри функции, нужно думать только о том, что должна делать эта функция.

Правильный интерфейс функции — залог хорошей архитектуры. Если функция принимает множество параметров, то это повод задуматься над интерфейсом этой функции. 

Поставим себя на место пользователя функции. Представим, что мы импортируем эту функцию из чужой библиотеки. На сколько нам удобно и понятно ей пользоваться?

Плохой пример:

```javascript
const getFileContent = (firstFileName, firstFileLocation, user, fsType) => {
  //
};
```

Функция принимает имя файла и его расположение отдельными параметрами, хотя достаточно передать сразу целиком путь к файлу, в котором уже содержится имя файла. Так же функция принимает текущего пользователя и тип файловой системы. Зачем это нужно — об этом мы можем только догадываться.

## Добавляем логику для каждого формата

После того, как мы выделили общую логику, приступим к формированию кода для каждого отдельного формата.

Исполняемый файл для каждого формата будет выглядеть похоже:

```javascript
#!/usr/bin/env node

import runJson from './formats/jsonFormat.js';

runJson();
```

И для YML:

```javascript
#!/usr/bin/env node

import runYml from './formats/ymlFormat.js';

runYml();
```

Важно, что в исполняемых файлах происходит просто вызов функции. Мы могли бы сделать общую функцию, которая бы принимала тип формата и вызывать ее:

```javascript
#!/usr/bin/node

import run from './index.js';

run('ymlFormat');
run('jsonFormat');
```

Но такой подход не очень хороший, так как вызов содержит логику — передачу параметра. Приходится думать, какой параметр передать. Вся логика должна находиться внутри функции, а исполняемый код просто вызывает эту функцию.

Теперь мы можем написать код для каждого формата. Но для этого нам нужно немного модифицировать общую логику. Посмотрим на нее еще раз:

```javascript
const app = () => {
  while (true) {
    const filePath = getFilePath();
    if (!filePath) {
      return;
    }
    const content = getFileContent(filePath);
    const result = parse(content);
    console.log(result);
  }
};
```

Функции `getFilePath()` и `getFileContent()` — общие для любых форматов, так как получение пути к файлу и чтение файла не зависят от формата. Эти функции мы можем определить в модуле общей логики, поэтому она будет выглядеть так. Но парсер уже в каждом формате разный, а мы не знаем, какой формат данных. На самом деле нам и не нужно это знать. 

Функции форматов могут сами передавать нужный парсер в виде функции. Эту функцию мы будем вызывать внутри общей логики. Для каждого формата будет вызываться своя функция. Для этого в `app()` сделаем передачу параметра. 

В итоге модуль общей логики будет выглядеть так:

```javascript
const getFilePath = () => {
  // ...
};

const getFileContent = (filePath) => {
  // ...
};

const app = (parse) => {
  while (true) {
    const filePath = getFilePath();
    if (!filePath) {
      return;
    }
    const content = getFileContent(filePath);
    const result = parse(content);
    console.log(result);
  }
};

export default app;
```

А модули форматов будут использовать общую логику и функцию `app()` и передавать в нее нужную функцию:

```javascript
// JSON-формат
import app from './app.js';

const jsonParse = (content) => {
  // json parse
};

app(jsonParse);
```

```javascript
// YML-формат
import app from './app.js';

const ymlParse = (content) => {
  // yml parse
};

app(ymlParse);
```

Такой подход позволяет легко дорабатывать приложение. Если нам понадобится добавить какой-то новый формат файлов, нам нужно будет добавить новый исполняемый файл и файл с кодом. В этом коде нам нужно создать свою функцию парсера нового формата данных и передать ее в общую логику приложения. Нам не нужно дорабатывать уже существующий код. 

В итоге, один раз написав модуль с общей логикой и логикой парсеров, нам не нужно больше вспоминать этот код, даже если нужно добавить новый формат.

## Итог

Мы разработали небольшой проект, в котором есть несколько исполняемых файлов с разной логикой, но при этом есть и общая логика. Мы выделили ее в отдельный модуль, чтобы он мог переиспользоваться в других модулях.

Функция с общей логикой использует внутри себя некую другую функцию `parse()`. Эта функция может быть разной для каждого формата данных. В этом сила абстракции: нам неважно, как функция работает внутри.

Целиком весь проект можно посмотреть [по этой ссылке](https://github.com/dzencot/file-format-output). В нем могут быть небольшие доработки, но основная суть сохранена.

## Полезные ссылки

* [Совершенный код: проектирование функций](https://ru.hexlet.io/blog/posts/sovershennyy-kod-proektirovanie-funktsiy)
* [Правильное именование в программировании](https://ru.hexlet.io/blog/posts/naming-in-programming)
* [Ошибки в именовании](https://ru.hexlet.io/blog/posts/naming-errors-1)
