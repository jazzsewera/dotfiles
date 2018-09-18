(function() {
  var cubes, list, math, num, number, opposite, race, square,
    slice = [].slice;

  number = 42;

  opposite = true;

  if (opposite) {
    number = -42;
  }

  square = function(x) {
    return x * x;
  };

  list = [1, 2, 3, 4, 5];

  math = {
    root: Math.sqrt,
    square: square,
    cube: function(x) {
      return x * square(x);
    }
  };

  race = function() {
    var runners, winner;
    winner = arguments[0], runners = 2 <= arguments.length ? slice.call(arguments, 1) : [];
    return print(winner, runners);
  };

  if (typeof elvis !== "undefined" && elvis !== null) {
    alert("I knew it!");
  }

  cubes = (function() {
    var i, len, results;
    results = [];
    for (i = 0, len = list.length; i < len; i++) {
      num = list[i];
      results.push(math.cube(num));
    }
    return results;
  })();

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy9zZXRpLXN5bnRheC9zYW1wbGUtZmlsZXMvQ29mZmVTY3JpcHQuY29mZmVlIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0FBQUEsTUFBQSxzREFBQTtJQUFBOztFQUFBLE1BQUEsR0FBVzs7RUFDWCxRQUFBLEdBQVc7O0VBR1gsSUFBZ0IsUUFBaEI7SUFBQSxNQUFBLEdBQVMsQ0FBQyxHQUFWOzs7RUFHQSxNQUFBLEdBQVMsU0FBQyxDQUFEO1dBQU8sQ0FBQSxHQUFJO0VBQVg7O0VBR1QsSUFBQSxHQUFPLENBQUMsQ0FBRCxFQUFJLENBQUosRUFBTyxDQUFQLEVBQVUsQ0FBVixFQUFhLENBQWI7O0VBR1AsSUFBQSxHQUNFO0lBQUEsSUFBQSxFQUFRLElBQUksQ0FBQyxJQUFiO0lBQ0EsTUFBQSxFQUFRLE1BRFI7SUFFQSxJQUFBLEVBQVEsU0FBQyxDQUFEO2FBQU8sQ0FBQSxHQUFJLE1BQUEsQ0FBTyxDQUFQO0lBQVgsQ0FGUjs7O0VBS0YsSUFBQSxHQUFPLFNBQUE7QUFDTCxRQUFBO0lBRE0sdUJBQVE7V0FDZCxLQUFBLENBQU0sTUFBTixFQUFjLE9BQWQ7RUFESzs7RUFJUCxJQUFzQiw4Q0FBdEI7SUFBQSxLQUFBLENBQU0sWUFBTixFQUFBOzs7RUFHQSxLQUFBOztBQUFTO1NBQUEsc0NBQUE7O21CQUFBLElBQUksQ0FBQyxJQUFMLENBQVUsR0FBVjtBQUFBOzs7QUExQlQiLCJzb3VyY2VzQ29udGVudCI6WyIjIEFzc2lnbm1lbnQ6XG5udW1iZXIgICA9IDQyXG5vcHBvc2l0ZSA9IHRydWVcblxuIyBDb25kaXRpb25zOlxubnVtYmVyID0gLTQyIGlmIG9wcG9zaXRlXG5cbiMgRnVuY3Rpb25zOlxuc3F1YXJlID0gKHgpIC0+IHggKiB4XG5cbiMgQXJyYXlzOlxubGlzdCA9IFsxLCAyLCAzLCA0LCA1XVxuXG4jIE9iamVjdHM6XG5tYXRoID1cbiAgcm9vdDogICBNYXRoLnNxcnRcbiAgc3F1YXJlOiBzcXVhcmVcbiAgY3ViZTogICAoeCkgLT4geCAqIHNxdWFyZSB4XG5cbiMgU3BsYXRzOlxucmFjZSA9ICh3aW5uZXIsIHJ1bm5lcnMuLi4pIC0+XG4gIHByaW50IHdpbm5lciwgcnVubmVyc1xuXG4jIEV4aXN0ZW5jZTpcbmFsZXJ0IFwiSSBrbmV3IGl0IVwiIGlmIGVsdmlzP1xuXG4jIEFycmF5IGNvbXByZWhlbnNpb25zOlxuY3ViZXMgPSAobWF0aC5jdWJlIG51bSBmb3IgbnVtIGluIGxpc3QpXG4iXX0=
