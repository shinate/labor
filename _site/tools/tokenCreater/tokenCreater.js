/**
 * Created by shinate on 16/6/14.
 */

(function () {
    var el = $('#tokenCreater');
    var button = el.find('button.create');
    var display = el.find('.display');

    $('.card').each(function () {
        $(this).height(Math.random() * 1000 % 200 + 100);
    })
})();