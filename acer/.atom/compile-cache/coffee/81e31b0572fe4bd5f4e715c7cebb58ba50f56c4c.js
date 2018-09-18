(function() {
  var QuickSort;

  QuickSort = (function() {
    function QuickSort() {}

    QuickSort.prototype.sort = function(items) {
      var current, left, pivot, right;
      if (items.length <= 1) {
        return items;
      }
      pivot = items.shift();
      left = [];
      right = [];
      while (items.length > 0) {
        current = items.shift();
        if (current < pivot) {
          left.push(current);
        } else {
          right.push(current);
        }
      }
      return sort(left).concat(pivot).concat(sort(right));
    };

    QuickSort.prototype.noop = function() {};

    return QuickSort;

  })();

  exports.modules = quicksort;

}).call(this);

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiL2hvbWUvamF6ei8uYXRvbS9wYWNrYWdlcy92aW0tbW9kZS1wbHVzL3NwZWMvZml4dHVyZXMvc2FtcGxlLmNvZmZlZSJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFRQTtBQUFBLE1BQUE7O0VBQU07Ozt3QkFDSixJQUFBLEdBQU0sU0FBQyxLQUFEO0FBQ0osVUFBQTtNQUFBLElBQWdCLEtBQUssQ0FBQyxNQUFOLElBQWdCLENBQWhDO0FBQUEsZUFBTyxNQUFQOztNQUVBLEtBQUEsR0FBUSxLQUFLLENBQUMsS0FBTixDQUFBO01BQ1IsSUFBQSxHQUFPO01BQ1AsS0FBQSxHQUFRO0FBSVIsYUFBTSxLQUFLLENBQUMsTUFBTixHQUFlLENBQXJCO1FBQ0UsT0FBQSxHQUFVLEtBQUssQ0FBQyxLQUFOLENBQUE7UUFDVixJQUFHLE9BQUEsR0FBVSxLQUFiO1VBQ0UsSUFBSSxDQUFDLElBQUwsQ0FBVSxPQUFWLEVBREY7U0FBQSxNQUFBO1VBR0UsS0FBSyxDQUFDLElBQU4sQ0FBVyxPQUFYLEVBSEY7O01BRkY7YUFPQSxJQUFBLENBQUssSUFBTCxDQUFVLENBQUMsTUFBWCxDQUFrQixLQUFsQixDQUF3QixDQUFDLE1BQXpCLENBQWdDLElBQUEsQ0FBSyxLQUFMLENBQWhDO0lBaEJJOzt3QkFrQk4sSUFBQSxHQUFNLFNBQUEsR0FBQTs7Ozs7O0VBR1IsT0FBTyxDQUFDLE9BQVIsR0FBa0I7QUF0QmxCIiwic291cmNlc0NvbnRlbnQiOlsiIyBUaGlzXG4jIGlzXG4jIENvbW1lbnRcblxuIyBPbmUgbGluZSBjb21tZW50XG5cbiMgQ29tbWVudFxuIyBib3JkZXJcbmNsYXNzIFF1aWNrU29ydFxuICBzb3J0OiAoaXRlbXMpIC0+XG4gICAgcmV0dXJuIGl0ZW1zIGlmIGl0ZW1zLmxlbmd0aCA8PSAxXG5cbiAgICBwaXZvdCA9IGl0ZW1zLnNoaWZ0KClcbiAgICBsZWZ0ID0gW11cbiAgICByaWdodCA9IFtdXG5cbiAgICAjIENvbW1lbnQgaW4gdGhlIG1pZGRsZVxuXG4gICAgd2hpbGUgaXRlbXMubGVuZ3RoID4gMFxuICAgICAgY3VycmVudCA9IGl0ZW1zLnNoaWZ0KClcbiAgICAgIGlmIGN1cnJlbnQgPCBwaXZvdFxuICAgICAgICBsZWZ0LnB1c2goY3VycmVudClcbiAgICAgIGVsc2VcbiAgICAgICAgcmlnaHQucHVzaChjdXJyZW50KVxuXG4gICAgc29ydChsZWZ0KS5jb25jYXQocGl2b3QpLmNvbmNhdChzb3J0KHJpZ2h0KSlcblxuICBub29wOiAtPlxuICAjIGp1c3QgYSBub29wXG5cbmV4cG9ydHMubW9kdWxlcyA9IHF1aWNrc29ydFxuIl19
