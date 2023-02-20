$(document).ready(function () {

    var itens = [];

    //localStorage.removeItem('data');

    //Recupera array de itens do localStorage e monta árvore
    getItens = function () {

        let storageData = [];

        if (localStorage.data) {
            storageData = JSON.parse(localStorage.data);
        }

        if (storageData.length == 0) {

            $('.data-container').hide();
            $('.empty-data').show();

        } else {

            $('.empty-data').hide();

            $('.data-container').html('');

            buildTree($('.data-container'), storageData);

            //Função click botão de remoção de item
            $('.remove-item').click(function () {

                const id = JSON.parse($(this).attr('data-item')).id;

                let formDataArray = JSON.parse(localStorage.data);

                removeItem(id, formDataArray);

                getItens();

            });

            //Função click botão de edição de item
            $('.edit-item').click(function () {

                let nivel = $(this).attr('data-nivel');

                let html = '<input type="hidden" name="id" aria-describedby="id">' +
                    '<input type="hidden" name="nivel" value="' + nivel + '">' +
                    '<div class="form-group">' +
                    '<label for="name">Nome</label>' +
                    '<input type="text" class="form-control" name="name" aria-describedby="name">' +
                    '</div>' +
                    '<div class="form-group d-flex justify-content-end">' +
                    '<button type="button" class="btn btn-link btn-sm add-children-edit">Adicionar Filho</button>' +
                    '</div>';

                $('#formEditItem').html(html);

                $('.add-children-edit').click(function () {
                    addChildren('formEditItem');
                });

                const id = JSON.parse($(this).attr('data-item')).id;
                const name = JSON.parse($(this).attr('data-item')).name;
                const children = JSON.parse($(this).attr('data-item')).children ? JSON.parse($(this).attr('data-item')).children : [];

                $('#formEditItem [name="id"]').val(id);
                $('#formEditItem [name="name"]').val(name);

                $.each(children, function (index, value) {

                    const qtdInputs = $('#formEditItem .form-control').length;

                    const stringValue = JSON.stringify(value);

                    html = '<div class="form-group">' +
                        '<label for="name">Filho ' + qtdInputs + '</label> ' +
                        '<input type="text" class="form-control" name="children" aria-describedby="children" value="' + value.name + '" data-item=\'' + stringValue + '\'>' +
                        '<div class="d-flex justify-content-end">' +
                        '<button type="button" class="btn btn-link btn-sm remove-children">remover</button>' +
                        '</div>' +
                        '</div>';

                    $('#formEditItem').append(html);

                });

                $('.remove-children').click(function () {
                    $(this).parent().parent().remove();
                });

                $('#modalEditItem').modal('show');

            });

            $("input[type='checkbox']").change(function () {

                if ($(this).parent().next()[0].className === 'tree-ul') {
                    $(this).parent().next().find("input[type='checkbox']").prop('checked', this.checked);
                }

            });

            $('.data-container').show();

        }

    };

    //Monta árvore de itens
    buildTree = function ($element, $object) {

        let $ul = $('<ul class="tree-ul"></ul>');
        let $li;

        $object.forEach(function (item, index) {

            const data = JSON.stringify(item);
            let padding = 28;
            let left = 42;
            let newHtml = '';

            if (item.nivel > 0) {

                if (item.nivel == 1 && index > 0) {
                    newHtml += '<div style="height: 30px; width: 1px; border-left: 1px #000 solid; margin-left: -14px; margin-top: -16px; position: absolute;"></div>';
                }

                padding = padding * item.nivel;

                if (item.nivel > 1) {

                    for (let i = 0; i < (item.nivel - 2); i++) {

                        left = left + 28;

                        newHtml += '<div style="width: 28px; height: 48px; border-left: 1px #000 solid; position: absolute; margin-left: -' + left + 'px; margin-top: -21px; margin-right: 25px;"></div>';

                    }

                    newHtml += '<div style="width: 29px; height: 26px; border-bottom: 1px #000 solid; border-left: 1px #000 solid; position: absolute; margin-left: -42px; margin-top: -20px; margin-right: 25px;"></div>';

                }

            }

            $li = $('<li class="d-flex align-items-center" style="padding-left: ' + padding + 'px;">' +
                '<input type="hidden" name="nivel" value="' + item.nivel + '">' +
                newHtml +
                '<input class="form-check-input tree-checkbox" type="checkbox" value="' + item.id + '" style="position: relative; z-index: 999;">' +
                '<label class="form-check-label" style="margin-left: 10px">' + item.name + '</label>' +
                '<button type="button" class="btn btn-link btn-sm remove-item" data-item=\'' + data + '\'><i class="fa-regular fa-trash-can"></i></button>' +
                '<button type="button" class="btn btn-link btn-sm edit-item" data-nivel="' + item.nivel + '" data-item=\'' + data + '\'><i class="fa-solid fa-pen-to-square"></i></button>' +
                '</li>');

            $ul.append($li);

            if (item.children && item.children.length > 0) {
                buildTree($ul, item.children, padding);
            }

            $element.append($ul);

        });

    }

    //Adiciona novo item
    addItem = function () {

        let formData = $('#formAddItem').serializeArray();

        let formDataObject = {};

        $.each(formData, function (index, formItem) {

            if (formItem.name !== 'children') {

                const key = formItem.name;
                const value = formItem.value;

                formDataObject['id'] = generateRandomId();

                formDataObject[key] = value;

                formDataObject['nivel'] = 1;

            } else {

                if (!formDataObject.children) {
                    formDataObject.children = Array();
                }

                const childrenValue = formItem.value;

                formDataObject.children.push({
                    id: generateRandomId(),
                    name: childrenValue,
                    nivel: 2
                });

            }

        });

        let formDataArray = Array();

        if (!localStorage.getItem('data')) {

            formDataArray.push(formDataObject);

        } else {

            formDataArray = JSON.parse(localStorage.data);

            formDataArray.push(formDataObject);

        }

        localStorage.data = JSON.stringify(formDataArray);

        $('#modalAddItem').modal('hide');

        messageToast('Item adicionado com sucesso.');

        getItens();

    };

    //Percorre array de itens e retorna item removido
    findInListRemove = function (formDataArray, id) {

        for (let item of formDataArray) {

            let foundElement = findElementRemove(item, id);

            if (foundElement) {

                return foundElement;

            }

        }

    }

    //Procura item a ser removido recursivamente em array multidimensional
    findElementRemove = function (currentElement, id) {

        if (currentElement.id === id) {
            return currentElement;
        }

        if (currentElement.children?.length > 0) {

            for (let child of currentElement.children) {

                let foundElement = findElementRemove(child, id);

                if (foundElement) {

                    currentElement.children = currentElement.children.filter((element) => {
                        return element.id !== id;
                    });

                    return foundElement;

                }

            }

        }

        return null;
    }

    //Função de remoção de item
    removeItem = function (id, formDataArray) {

        formDataItem = formDataArray.filter((element) => {
            return element.id == id;
        });

        if (formDataItem.length > 0) {

            formDataArray = formDataArray.filter((element) => {
                return element.id !== id;
            });

        } else {

            findInListRemove(formDataArray, id);

        }

        localStorage.data = JSON.stringify(formDataArray);

        messageToast('Item removido com sucesso.');

    };

    //Função de edição de item
    editItem = function () {

        let formData = $('#formEditItem input');
        let formDataObject = {};
        let nivel = 1;

        $.each(formData, function (index, formItem) {

            let inputName = $(formItem).attr('name');
            let inputValue = $(formItem).val();

            if (inputName == 'nivel') {
                nivel = inputValue;
            }

        });

        $.each(formData, function (index, formItem) {

            let inputName = $(formItem).attr('name');
            let inputValue = $(formItem).val();

            if (inputName !== 'children') {

                formDataObject[inputName] = inputValue;

            } else {

                if (!formDataObject.children) {
                    formDataObject.children = Array();
                }

                const childrenObject = $(formItem).attr('data-item') !== undefined ? JSON.parse($(formItem).attr('data-item')) : null;

                if ($(formItem).attr('data-item') == undefined) {

                    formDataObject.children.push({
                        id: generateRandomId(),
                        name: inputValue,
                        nivel: Number(nivel) + 1
                    });

                } else {

                    formDataObject.children.push({
                        id: generateRandomId(),
                        name: inputValue,
                        nivel: Number(nivel) + 1,
                        children: childrenObject.children
                    });

                }

            }

        });

        formDataArray = JSON.parse(localStorage.data);

        let parent = findInListEdit(formDataArray, formDataObject.id);

        parent.name = formDataObject.name;

        parent.children = formDataObject.children;

        localStorage.data = JSON.stringify(formDataArray);

        $('#modalEditItem').modal('hide');

        messageToast('Item editado com sucesso.');

        getItens();

    }

    //Percorre array de itens e retorna item editado
    findInListEdit = function (formDataArray, id) {

        for (let item of formDataArray) {

            let foundElement = findElementEdit(item, id);

            if (foundElement) {

                return foundElement;

            }

        }

    }

    //Encontra item a ser editado recursivamente em array multidimensional
    findElementEdit = function (currentElement, id) {

        if (currentElement.id === id) {
            return currentElement;
        }

        if (currentElement.children?.length > 0) {

            for (let child of currentElement.children) {

                let foundElement = findElementEdit(child, id);

                if (foundElement) {

                    return foundElement;

                }

            }

        }

        return null;
    }

    //Adiciona input filho em form
    addChildren = function (form) {

        const qtdInputs = $('#' + form + ' .form-control').length;

        const html = '<div class="form-group">' +
            '<label for="name">Filho ' + qtdInputs + '</label> ' +
            '<input type="text" class="form-control" name="children" aria-describedby="children">' +
            '<div class="d-flex justify-content-end">' +
            '<button type="button" class="btn btn-link btn-sm remove-children">remover</button>' +
            '</div>' +
            '</div>';

        $('#' + form).append(html);

        $('.remove-children').click(function () {
            $(this).parent().parent().remove();
        });
        
    };

    //Gera id Randomico
    generateRandomId = function () {
        return Math.floor(Math.random() * 26) + Date.now().toString();
    }

    //Dispara mensagem toast
    messageToast = function (message) {
        $('.toast-body').html(message);
        $('.toast').toast('show');
    }

    //Abre modal de adicionar item
    openModalAdd = function () {

        let html = '<input type="hidden" name="id" aria-describedby="id">' +
            '<input type="hidden" name="nivel" value="1">' +
            '<div class="form-group">' +
            '<label for="name">Nome</label>' +
            '<input type="text" class="form-control" name="name" aria-describedby="name">' +
            '</div>' +
            '<div class="form-group d-flex justify-content-end">' +
            '<button type="button" class="btn btn-link btn-sm add-children">Adicionar Filho</button>' +
            '</div>';

        $('#formAddItem').html(html);

        $('.add-children').click(function () {
            addChildren('formAddItem');
        });

        $('#modalAddItem').modal('show');

    }

    getItens();

});