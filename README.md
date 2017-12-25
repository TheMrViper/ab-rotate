# Подключение к сайту
Для начала работы с ротатором, нам необходимо его подключить к сайту.
Сделать это можно несколькими способами. В данном примере мы будем использовать GTM 

1. Откройте нужный Workspace внутри GTM 
2. Создайте тег, тип тега **html code**
3. Вставьте код из [файла](https://github.com/TheMrViper/ab-rotate/blob/master/mobile-detect.js "файла") внутрь тега
4. Вставьте код из [файла](https://github.com/TheMrViper/ab-rotate/blob/master/rotator.js "файла") внутрь тега
5. Поставьте найвысший приоритет для тега

В результате дожно получиться как на картинке
[![](https://raw.githubusercontent.com/TheMrViper/ab-rotate/master/docs/5711501eaf.png)](https://raw.githubusercontent.com/TheMrViper/ab-rotate/master/docs/5711501eaf.png)

# Создание експеримента
Для создания нового експеримента, нам нужен уже готовый и оттестированый код експеримента, в данном примере мы будем использовать 

`console.log('test {variation}');`

1. Откройте нужный Workspace внутри GTM
2. Создайте тег, тип тега **html code**
3. Вставьте код вашего експеримента вместе с кодом ротатора

        window.experiments = window.experiments || [];
        window.experiments.push({
            name: 'TST100',
            devices: ['MB', 'TB', 'DT'],
            allocation: [34, 33, 33],
            mode: 'qa',
            variations: [{
                name: 'O',
                callback: function() {
					console.log('O');
                }
            },{
                name: 'V1',
                callback: function() {
                    console.log('V1');
                }
            },{
                name: 'V2',
                callback: function() {
                    console.log('V2');
                }
            }],
            afterCallback: function(experiment, variation) {
                console.log(experiment, variation);
            }
        });
4. Включите опцию запускания базового кода, перед кодом експеримента
5. Добавьте тригеры для тега

[![](https://raw.githubusercontent.com/TheMrViper/ab-rotate/master/docs/cfc8365290.png)](https://raw.githubusercontent.com/TheMrViper/ab-rotate/master/docs/cfc8365290.png)
## Создание вариации
Базовый код ротатора содержит свойство variations тип array 
Для добавления вариации, в него нужно добавить объект 
	
    {
    	name: '<имя вариации>',
    	callback: function() {
    		console.log('V1');
    		<код вариации>
    	}
     }
А так же изменить свойсво 
`allocation: [50, 50]`
allocation - Это массив чисел,  который распределяет вариции, в данном примере, если експеримент содержит Оригинал, и Вариацию 1, то трафик будет поделён ровно пополам. 
Если у Вас больше вариаций, нужно добавить процент пользователей в этот массив. 
Важно! Сума чисел массива, не дожна привышать **100**

## Тестирование експеримента 
Тестирование експеримента происходит в 2 етапа
Для управления етапами, нужно установить свойство 
**mode** в **production** или **qa**
Результат: `mode: 'production'`
Описание значений 
1. qa - Запускает експеримент только если у пользователя установлен параметр `qa_mode=true` в URL
2. production -  Запускает експеримент в независимости от параметров пользователя

## Таргетинг в зависимости от *user device* 
Для управления таргетингом експеримента в зависимости от user device 
Нужно использовать свойство device типа array
Пример в коде: `device: ['MB', 'TB', 'DT']`

Этот массив принимает значения типа string
Возможные значения:
1. MB - Запускать експеримент на мобильных
2. TB -  Запускать експеримент на планшетах
3. DT - Запускать експеримент на ПК

В данном примере, експеримент будет запущен на всех девайсах
Для более гибкой настройки, нужно использовать тригеры в GTM

## Подключение систем аналитики
Для подключения систем аналитики, коду експеримента нужно добавить одно из свойств:
1. beforeCallback: function - запускает функцию до отработки експеримента
2. afterCallback: function - запускает функцию после отработки експеримента

Пример использования

        afterCallback: function(experiment, variation) {  
            var variation_name = experiment.name+'_'+experiment.device+'_'+variation.name;
          	window._kmq = window._kmq || [];
    		window.kissEventProperties ['backend_test_variation'] = variation_name;      
    		window.kissEventProperties ['TST107_variation'] = variation_name;      
          	window._kmq.push(['record', 'Experiment started', kissEventProperties]);
            
          	(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
            (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
            m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
            })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    
            ga('create', 'UA-230595-17', 'auto');
            ga('send', 'event', 'CRO', experiment.name+'_'+experiment.device, variation.name, {'nonInteraction':1} );
        }
