'use babel';

var path = require('path');
var generate = require('markdown-it-testgen');
var assert = require('assert');

var _require = require('../../lib/markdown-it-math/index.js');

var math_plugin = _require.math_plugin;

describe('Tables with default delimiters', function () {
  var md = require('markdown-it')({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true
  }).use(math_plugin);

  generate(path.join(__dirname, 'fixtures/tables.txt'), md);
});

describe('Tables with non-default delimiters', function () {
  var md = require('markdown-it')({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true
  }).use(math_plugin, {
    inlineDelim: [['$', '$']],
    blockDelim: [['$$', '$$']]
  });

  generate(path.join(__dirname, 'fixtures/tables.txt'), md);
});

describe('Tables with multiple non-default delimiters', function () {
  var md = require('markdown-it')({
    html: true,
    langPrefix: '',
    typographer: true,
    linkify: true
  }).use(math_plugin, {
    inlineDelim: [['$', '$']],
    blockDelim: [['$$', '$$']]
  }).use(math_plugin, {
    inlineDelim: [['\\(', '\\)']],
    blockDelim: [['\\[', '\\]']]
  });

  generate(path.join(__dirname, 'fixtures/tables.txt'), md);
});

describe('Parsing pipe inside inline maths delimiters `$`', function () {
  var md = require('markdown-it')().use(math_plugin, {
    inlineDelim: [['$', '$']],
    blockDelim: [['$$', '$$']]
  });

  it('Should not delimit a column of a table', function () {
    var res1 = md.render('col a | col b\n--|--\n$P(A|B)$ | foo');
    assert.equal(res1, '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><span class="math inline">P(A|B)</span></td>\n<td>foo</td>\n</tr>\n</tbody>\n</table>\n');
  });

  it('Should respect multiple inline math on the same row', function () {
    var res1 = md.render('col a | col b | col c\n--|--|--\n$P(A|B)$ | foo | $P(A|B)$');
    assert.equal(res1, '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n<th>col c</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><span class="math inline">P(A|B)</span></td>\n<td>foo</td>\n<td><span class="math inline">P(A|B)</span></td>\n</tr>\n</tbody>\n</table>\n');
  });
});

describe('Parsing pipe inside inline maths delimiters `\\(`, `\\)`', function () {
  it('Should not delimit a column of a table', function () {
    var md = require('markdown-it')().use(math_plugin, {
      inlineDelim: [['\\(', '\\)']],
      blockDelim: [['\\[', '\\]']]
    });

    var res1 = md.render('col a | col b\n--|--\n\\(P(A|B)\\) | foo');
    assert.equal(res1, '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><span class="math inline">P(A|B)</span></td>\n<td>foo</td>\n</tr>\n</tbody>\n</table>\n');
  });
});

describe('Parsing pipe inside inline maths configured with multiple delimiters', function () {
  var md = require('markdown-it')().use(math_plugin, {
    inlineDelim: [['$', '$'], ['\\(', '\\)']],
    blockDelim: [['$$', '$$'], ['\\[', '\\]']]
  });

  it('Should not delimit a column of a table for `$`', function () {
    var res1 = md.render('col a | col b\n--|--\n$P(A|B)$ | foo');
    assert.equal(res1, '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><span class="math inline">P(A|B)</span></td>\n<td>foo</td>\n</tr>\n</tbody>\n</table>\n');
  });

  it('Should not delimit a column of a table for `\\(`, `\\)`', function () {
    var res1 = md.render('col a | col b\n--|--\n\\(P(A|B)\\) | foo');
    assert.equal(res1, '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td><span class="math inline">P(A|B)</span></td>\n<td>foo</td>\n</tr>\n</tbody>\n</table>\n');
  });
});

describe('Parsing pipe inside unclosed maths delimiter', function () {
  it('Should parse columns as if they were normal text', function () {
    var md = require('markdown-it')().use(math_plugin, {
      inlineDelim: [['$', '$']],
      blockDelim: [['$$', '$$']]
    });

    var res1 = md.render('col a | col b\n--|--\n$P(A|B) | foo');
    assert.equal(res1, '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>$P(A</td>\n<td>B)</td>\n</tr>\n</tbody>\n</table>\n');
  });
});

describe('Parsing pipe inside unopened maths delimiter', function () {
  it('Should parse columns as if they were normal text', function () {
    var md = require('markdown-it')().use(math_plugin, {
      inlineDelim: [['$', '$']],
      blockDelim: [['$$', '$$']]
    });

    var res1 = md.render('col a | col b\n--|--\nP(A|B)$ | foo');
    assert.equal(res1, '<table>\n<thead>\n<tr>\n<th>col a</th>\n<th>col b</th>\n</tr>\n</thead>\n<tbody>\n<tr>\n<td>P(A</td>\n<td>B)$</td>\n</tr>\n</tbody>\n</table>\n');
  });
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9ob21lL2phenovLmF0b20vcGFja2FnZXMvbWFya2Rvd24tcHJldmlldy1wbHVzL3NwZWMvbWFya2Rvd24taXQtbWF0aC90YWJsZXMuc3BlYy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxXQUFXLENBQUE7O0FBRVgsSUFBSSxJQUFJLEdBQUcsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzFCLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxxQkFBcUIsQ0FBQyxDQUFBO0FBQzdDLElBQUksTUFBTSxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQTs7ZUFDUixPQUFPLENBQUMscUNBQXFDLENBQUM7O0lBQTlELFdBQVcsWUFBWCxXQUFXOztBQUVqQixRQUFRLENBQUMsZ0NBQWdDLEVBQUUsWUFBVztBQUNwRCxNQUFJLEVBQUUsR0FBRyxPQUFPLENBQUMsYUFBYSxDQUFDLENBQUM7QUFDOUIsUUFBSSxFQUFFLElBQUk7QUFDVixjQUFVLEVBQUUsRUFBRTtBQUNkLGVBQVcsRUFBRSxJQUFJO0FBQ2pCLFdBQU8sRUFBRSxJQUFJO0dBQ2QsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTs7QUFFbkIsVUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsU0FBUyxFQUFFLHFCQUFxQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7Q0FDMUQsQ0FBQyxDQUFBOztBQUVGLFFBQVEsQ0FBQyxvQ0FBb0MsRUFBRSxZQUFXO0FBQ3hELE1BQUksRUFBRSxHQUFHLE9BQU8sQ0FBQyxhQUFhLENBQUMsQ0FBQztBQUM5QixRQUFJLEVBQUUsSUFBSTtBQUNWLGNBQVUsRUFBRSxFQUFFO0FBQ2QsZUFBVyxFQUFFLElBQUk7QUFDakIsV0FBTyxFQUFFLElBQUk7R0FDZCxDQUFDLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtBQUNsQixlQUFXLEVBQUUsQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQztBQUN6QixjQUFVLEVBQUUs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bEUsSUFBRSxDQUFDLGtEQUFrRCxFQUFFLFlBQVc7QUFDaEUsUUFBSSxFQUFFLEdBQUcsT0FBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtBQUNqRCxpQkFBVyxFQUFFLENBQUMsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFDLENBQUM7QUFDekIsZ0JBQVUsRUFBRSxDQUFDLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxDQUFDO0tBQzNCLENBQUMsQ0FBQTs7QUFFRixRQUFJLElBQUksR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLHFDQUFxQyxDQUFDLENBQUE7QUFDM0QsVUFBTSxDQUFDLEtBQUssQ0FDVixJQUFJLEVBQ0osaUpBQWlKLENBQ2xKLENBQUE7R0FDRixDQUFDLENBQUE7Q0FDSCxDQUFDLENBQUEiLCJmaWxlIjoiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9tYXJrZG93bi1wcmV2aWV3LXBsdXMvc3BlYy9tYXJrZG93bi1pdC1tYXRoL3RhYmxlcy5zcGVjLmpzIiwic291cmNlc0NvbnRlbnQiOlsiJ3VzZSBiYWJlbCdcblxudmFyIHBhdGggPSByZXF1aXJlKCdwYXRoJylcbnZhciBnZW5lcmF0ZSA9IHJlcXVpcmUoJ21hcmtkb3duLWl0LXRlc3RnZW4nKVxudmFyIGFzc2VydCA9IHJlcXVpcmUoJ2Fzc2VydCcpXG52YXIgeyBtYXRoX3BsdWdpbiB9ID0gcmVxdWlyZSgnLi4vLi4vbGliL21hcmtkb3duLWl0LW1hdGgvaW5kZXguanMnKVxuXG5kZXNjcmliZSgnVGFibGVzIHdpdGggZGVmYXVsdCBkZWxpbWl0ZXJzJywgZnVuY3Rpb24oKSB7XG4gIHZhciBtZCA9IHJlcXVpcmUoJ21hcmtkb3duLWl0Jykoe1xuICAgIGh0bWw6IHRydWUsXG4gICAgbGFuZ1ByZWZpeDogJycsXG4gICAgdHlwb2dyYXBoZXI6IHRydWUsXG4gICAgbGlua2lmeTogdHJ1ZSxcbiAgfSkudXNlKG1hdGhfcGx1Z2luKVxuXG4gIGdlbmVyYXRlKHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy90YWJsZXMudHh0JyksIG1kKVxufSlcblxuZGVzY3JpYmUoJ1RhYmxlcyB3aXRoIG5vbi1kZWZhdWx0IGRlbGltaXRlcnMnLCBmdW5jdGlvbigpIHtcbiAgdmFyIG1kID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKSh7XG4gICAgaHRtbDogdHJ1ZSxcbiAgICBsYW5nUHJlZml4OiAnJyxcbiAgICB0eXBvZ3JhcGhlcjogdHJ1ZSxcbiAgICBsaW5raWZ5OiB0cnVlLFxuICB9KS51c2UobWF0aF9wbHVnaW4sIHtcbiAgICBpbmxpbmVEZWxpbTogW1snJCcsICckJ11dLFxuICAgIGJsb2NrRGVsaW06IFtbJyQkJywgJyQkJ11dLFxuICB9KVxuXG4gIGdlbmVyYXRlKHBhdGguam9pbihfX2Rpcm5hbWUsICdmaXh0dXJlcy90YWJsZXMudHh0JyksIG1kKVxufSlcblxuZGVzY3JpYmUoJ1RhYmxlcyB3aXRoIG11bHRpcGxlIG5vbi1kZWZhdWx0IGRlbGltaXRlcnMnLCBmdW5jdGlvbigpIHtcbiAgdmFyIG1kID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKSh7XG4gICAgaHRtbDogdHJ1ZSxcbiAgICBsYW5nUHJlZml4OiAnJyxcbiAgICB0eXBvZ3JhcGhlcjogdHJ1ZSxcbiAgICBsaW5raWZ5OiB0cnVlLFxuICB9KVxuICAgIC51c2UobWF0aF9wbHVnaW4sIHtcbiAgICAgIGlubGluZURlbGltOiBbWyckJywgJyQnXV0sXG4gICAgICBibG9ja0RlbGltOiBbWyckJCcsICckJCddXSxcbiAgICB9KVxuICAgIC51c2UobWF0aF9wbHVnaW4sIHtcbiAgICAgIGlubGluZURlbGltOiBbWydcXFxcKCcsICdcXFxcKSddXSxcbiAgICAgIGJsb2NrRGVsaW06IFtbJ1xcXFxbJywgJ1xcXFxdJ11dLFxuICAgIH0pXG5cbiAgZ2VuZXJhdGUocGF0aC5qb2luKF9fZGlybmFtZSwgJ2ZpeHR1cmVzL3RhYmxlcy50eHQnKSwgbWQpXG59KVxuXG5kZXNjcmliZSgnUGFyc2luZyBwaXBlIGluc2lkZSBpbmxpbmUgbWF0aHMgZGVsaW1pdGVycyBgJGAnLCBmdW5jdGlvbigpIHtcbiAgdmFyIG1kID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKSgpLnVzZShtYXRoX3BsdWdpbiwge1xuICAgIGlubGluZURlbGltOiBbWyckJywgJyQnXV0sXG4gICAgYmxvY2tEZWxpbTogW1snJCQnLCAnJCQnXV0sXG4gIH0pXG5cbiAgaXQoJ1Nob3VsZCBub3QgZGVsaW1pdCBhIGNvbHVtbiBvZiBhIHRhYmxlJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIHJlczEgPSBtZC5yZW5kZXIoJ2NvbCBhIHwgY29sIGJcXG4tLXwtLVxcbiRQKEF8QikkIHwgZm9vJylcbiAgICBhc3NlcnQuZXF1YWwoXG4gICAgICByZXMxLFxuICAgICAgJzx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5jb2wgYTwvdGg+XFxuPHRoPmNvbCBiPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+PHNwYW4gY2xhc3M9XCJtYXRoIGlubGluZVwiPlAoQXxCKTwvc3Bhbj48L3RkPlxcbjx0ZD5mb288L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbicsXG4gICAgKVxuICB9KVxuXG4gIGl0KCdTaG91bGQgcmVzcGVjdCBtdWx0aXBsZSBpbmxpbmUgbWF0aCBvbiB0aGUgc2FtZSByb3cnLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzMSA9IG1kLnJlbmRlcihcbiAgICAgICdjb2wgYSB8IGNvbCBiIHwgY29sIGNcXG4tLXwtLXwtLVxcbiRQKEF8QikkIHwgZm9vIHwgJFAoQXxCKSQnLFxuICAgIClcbiAgICBhc3NlcnQuZXF1YWwoXG4gICAgICByZXMxLFxuICAgICAgJzx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5jb2wgYTwvdGg+XFxuPHRoPmNvbCBiPC90aD5cXG48dGg+Y29sIGM8L3RoPlxcbjwvdHI+XFxuPC90aGVhZD5cXG48dGJvZHk+XFxuPHRyPlxcbjx0ZD48c3BhbiBjbGFzcz1cIm1hdGggaW5saW5lXCI+UChBfEIpPC9zcGFuPjwvdGQ+XFxuPHRkPmZvbzwvdGQ+XFxuPHRkPjxzcGFuIGNsYXNzPVwibWF0aCBpbmxpbmVcIj5QKEF8Qik8L3NwYW4+PC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG4nLFxuICAgIClcbiAgfSlcbn0pXG5cbmRlc2NyaWJlKCdQYXJzaW5nIHBpcGUgaW5zaWRlIGlubGluZSBtYXRocyBkZWxpbWl0ZXJzIGBcXFxcKGAsIGBcXFxcKWAnLCBmdW5jdGlvbigpIHtcbiAgaXQoJ1Nob3VsZCBub3QgZGVsaW1pdCBhIGNvbHVtbiBvZiBhIHRhYmxlJywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1kID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKSgpLnVzZShtYXRoX3BsdWdpbiwge1xuICAgICAgaW5saW5lRGVsaW06IFtbJ1xcXFwoJywgJ1xcXFwpJ11dLFxuICAgICAgYmxvY2tEZWxpbTogW1snXFxcXFsnLCAnXFxcXF0nXV0sXG4gICAgfSlcblxuICAgIHZhciByZXMxID0gbWQucmVuZGVyKCdjb2wgYSB8IGNvbCBiXFxuLS18LS1cXG5cXFxcKFAoQXxCKVxcXFwpIHwgZm9vJylcbiAgICBhc3NlcnQuZXF1YWwoXG4gICAgICByZXMxLFxuICAgICAgJzx0YWJsZT5cXG48dGhlYWQ+XFxuPHRyPlxcbjx0aD5jb2wgYTwvdGg+XFxuPHRoPmNvbCBiPC90aD5cXG48L3RyPlxcbjwvdGhlYWQ+XFxuPHRib2R5Plxcbjx0cj5cXG48dGQ+PHNwYW4gY2xhc3M9XCJtYXRoIGlubGluZVwiPlAoQXxCKTwvc3Bhbj48L3RkPlxcbjx0ZD5mb288L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbicsXG4gICAgKVxuICB9KVxufSlcblxuZGVzY3JpYmUoJ1BhcnNpbmcgcGlwZSBpbnNpZGUgaW5saW5lIG1hdGhzIGNvbmZpZ3VyZWQgd2l0aCBtdWx0aXBsZSBkZWxpbWl0ZXJzJywgZnVuY3Rpb24oKSB7XG4gIHZhciBtZCA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JykoKS51c2UobWF0aF9wbHVnaW4sIHtcbiAgICBpbmxpbmVEZWxpbTogW1snJCcsICckJ10sIFsnXFxcXCgnLCAnXFxcXCknXV0sXG4gICAgYmxvY2tEZWxpbTogW1snJCQnLCAnJCQnXSwgWydcXFxcWycsICdcXFxcXSddXSxcbiAgfSlcblxuICBpdCgnU2hvdWxkIG5vdCBkZWxpbWl0IGEgY29sdW1uIG9mIGEgdGFibGUgZm9yIGAkYCcsIGZ1bmN0aW9uKCkge1xuICAgIHZhciByZXMxID0gbWQucmVuZGVyKCdjb2wgYSB8IGNvbCBiXFxuLS18LS1cXG4kUChBfEIpJCB8IGZvbycpXG4gICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgcmVzMSxcbiAgICAgICc8dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+Y29sIGE8L3RoPlxcbjx0aD5jb2wgYjwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPjxzcGFuIGNsYXNzPVwibWF0aCBpbmxpbmVcIj5QKEF8Qik8L3NwYW4+PC90ZD5cXG48dGQ+Zm9vPC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG4nLFxuICAgIClcbiAgfSlcblxuICBpdCgnU2hvdWxkIG5vdCBkZWxpbWl0IGEgY29sdW1uIG9mIGEgdGFibGUgZm9yIGBcXFxcKGAsIGBcXFxcKWAnLCBmdW5jdGlvbigpIHtcbiAgICB2YXIgcmVzMSA9IG1kLnJlbmRlcignY29sIGEgfCBjb2wgYlxcbi0tfC0tXFxuXFxcXChQKEF8QilcXFxcKSB8IGZvbycpXG4gICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgcmVzMSxcbiAgICAgICc8dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+Y29sIGE8L3RoPlxcbjx0aD5jb2wgYjwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPjxzcGFuIGNsYXNzPVwibWF0aCBpbmxpbmVcIj5QKEF8Qik8L3NwYW4+PC90ZD5cXG48dGQ+Zm9vPC90ZD5cXG48L3RyPlxcbjwvdGJvZHk+XFxuPC90YWJsZT5cXG4nLFxuICAgIClcbiAgfSlcbn0pXG5cbmRlc2NyaWJlKCdQYXJzaW5nIHBpcGUgaW5zaWRlIHVuY2xvc2VkIG1hdGhzIGRlbGltaXRlcicsIGZ1bmN0aW9uKCkge1xuICBpdCgnU2hvdWxkIHBhcnNlIGNvbHVtbnMgYXMgaWYgdGhleSB3ZXJlIG5vcm1hbCB0ZXh0JywgZnVuY3Rpb24oKSB7XG4gICAgdmFyIG1kID0gcmVxdWlyZSgnbWFya2Rvd24taXQnKSgpLnVzZShtYXRoX3BsdWdpbiwge1xuICAgICAgaW5saW5lRGVsaW06IFtbJyQnLCAnJCddXSxcbiAgICAgIGJsb2NrRGVsaW06IFtbJyQkJywgJyQkJ11dLFxuICAgIH0pXG5cbiAgICB2YXIgcmVzMSA9IG1kLnJlbmRlcignY29sIGEgfCBjb2wgYlxcbi0tfC0tXFxuJFAoQXxCKSB8IGZvbycpXG4gICAgYXNzZXJ0LmVxdWFsKFxuICAgICAgcmVzMSxcbiAgICAgICc8dGFibGU+XFxuPHRoZWFkPlxcbjx0cj5cXG48dGg+Y29sIGE8L3RoPlxcbjx0aD5jb2wgYjwvdGg+XFxuPC90cj5cXG48L3RoZWFkPlxcbjx0Ym9keT5cXG48dHI+XFxuPHRkPiRQKEE8L3RkPlxcbjx0ZD5CKTwvdGQ+XFxuPC90cj5cXG48L3Rib2R5PlxcbjwvdGFibGU+XFxuJyxcbiAgICApXG4gIH0pXG59KVxuXG5kZXNjcmliZSgnUGFyc2luZyBwaXBlIGluc2lkZSB1bm9wZW5lZCBtYXRocyBkZWxpbWl0ZXInLCBmdW5jdGlvbigpIHtcbiAgaXQoJ1Nob3VsZCBwYXJzZSBjb2x1bW5zIGFzIGlmIHRoZXkgd2VyZSBub3JtYWwgdGV4dCcsIGZ1bmN0aW9uKCkge1xuICAgIHZhciBtZCA9IHJlcXVpcmUoJ21hcmtkb3duLWl0JykoKS51c2UobWF0aF9wbHVnaW4sIHtcbiAgICAgIGlubGluZURlbGltOiBbWyckJywgJyQnXV0sXG4gICAgICBibG9ja0RlbGltOiBbWyckJCcsICckJCddXSxcbiAgICB9KVxuXG4gICAgdmFyIHJlczEgPSBtZC5yZW5kZXIoJ2NvbCBhIHwgY29sIGJcXG4tLXwtLVxcblAoQXxCKSQgfCBmb28nKVxuICAgIGFzc2VydC5lcXVhbChcbiAgICAgIHJlczEsXG4gICAgICAnPHRhYmxlPlxcbjx0aGVhZD5cXG48dHI+XFxuPHRoPmNvbCBhPC90aD5cXG48dGg+Y29sIGI8L3RoPlxcbjwvdHI+XFxuPC90aGVhZD5cXG48dGJvZHk+XFxuPHRyPlxcbjx0ZD5QKEE8L3RkPlxcbjx0ZD5CKSQ8L3RkPlxcbjwvdHI+XFxuPC90Ym9keT5cXG48L3RhYmxlPlxcbicsXG4gICAgKVxuICB9KVxufSlcbiJdfQ==