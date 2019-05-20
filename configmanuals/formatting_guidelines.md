# Wskazówki dot. czytelnego formatowania kodu

## 1. Nawiasy klamrowe
Starajmy się umieszczać nawias otwierający po spacji po słowie kluczowym,
np. `if`, `else`, `do`, `while`, `for`, itp.  
Starajmy się także, aby wyrażenia dotyczące tego samego (`if, else`), były w jednym ciągu, czyli
nie stawiajmy nowej linii `Enter` między klamrą zamykającą `if`, a wyrażeniem `else`.

```c
if (x == 0) {
  function0();
} else if (x == 1) {
  function1();
} else {
  function();
}
```

## 2. Nawiasy okrągłe
W przypadku funkcji trzeba umieszczać nawiasy bezpośrednio po nazwie funkcji, ale po wyrażeniach typu `if`, czy `for` już nie.
W celu rozróżnienia funkcji od słów kluczowych, najlepiej jest umieszczać nawiasy następująco:

```
if (a != 1) {
  for (int i = 0; i < 5, i++) {
    function1();
  }
  function();
}
```

## 3. Nazewnictwo funkcji, zmiennych i ogólnie tego, na co mamy wpływ
### a. Zapis wielowyrazowy
Powinno się stosować zapis wielowyrazowy (prawie) każdej zmiennej, czy funkcji. Istnieją dwie główne szkoły, jak to robić:
- Szkoła C, używana także w C++, Pythonie, Javascript, czyli w większości: `funkcja_wielowyrazowa()`, `zmienna_wielowyrazowa`, `KlasaWielowyrazowa`, `CONSTANT`
- Szkoła Javy, dość przejrzysta i wygodna: `funkcjaWielowyrazowa()`, `zmiennaWielowyrazowa`, `KlasaWielowyrazowa`, `CONSTANT`
Szkoła C nie ma dokładnych wytycznych (tak jak w Javie), którą koncepcję wybrać, więc dopóki zachowujemy spójność, wszystko jest w porządku.
### b. Nazewnictwo
Starajmy się dobierać bardzo deskryptywne nazwy naszych funkcji.
Jeżeli funkcja oblicza nam sinus z liczby, nazwijmy ją `oblicz_sinus(float kat)`, lub lepiej `compute_sinus(float angle)`, jako że angielski jest jedynym językiem na świecie.
*Warto jest nazywać funkcje czasownikami!*  
Zmienne zazwyczaj nazywamy rzeczownikami, chyba że zmienna jest typu `bool`, czyli true/false, wtedy zaczynamy od "czy":

```c
int liczba_pracownikow;
float zarobki_pracownika;
bool czy_ma_ubezpieczenie;
int oblicz_stawke_netto() { /* ... */ }
```

albo lepiej:

```c
int number_of_employees; // int employees_count;
float employee_wage;
bool has_insurance; // bool is_insured;
int compute_net_wage() { /* ... */ }
```

**Im dłuższa nazwa zmiennej / funkcji i więcej mówi o tym, co dokładnie robi / przechowuje, tym lepiej!**

## 4. Wcięcia
Nowe ekrany robią się coraz lepsze, więc zwiększa się też czytelność. Tradycyjnie, wcięcia robiło się tabem (hard tab), który zajmował szerokość 8 znaków. Potem 4 znaków.
Teraz najczęściej stosuje się "miękkie" tabulatory (soft tabs), czyli spacje. Większość ludzi nadal używa 4, ale coraz częściej, zwłaszcza w Web Development, widzi się po 2 spacje, ponieważ zajmuje to mniej miejsca, a jest tak samo przejrzyste.
Najważniejsze, żeby te wcięcia były:

```c
int main() {

  int some_variable;

  for (int i = 0; i < 5; i++) {
    inclined_function();
    if (error_function()) {
      break;
    } else {
      continue;
    }
  }

  switch (some_variable) {
    case 1:
      function1();
      break;
    default:
      function_default();
      break;
  }

  struct employee {
    int wage;
    bool has_insurance;
  }

  if (!employee.has_insurance) {
    offer_insurance();
  }
}
```

Można oddzielić sobie poszczególne bloki kodu (np. pętlę `for`) pustymi liniami, dla większej czytelności.

## Pozostałe spacje
Warto używać spacji tam, gdzie zwiększy to czytelność, czyli np. przy inicjalizacji zmiennych, kiedy mamy za dużo nawiasów w jednym miejscu, itp. Nie ma co do tego jakiejś złotej zasady, ale jeśli jest coś dla nas czytelniejszego ze spacją, to ją wstawmy:

```c
int some_variable=1; // bez spacji

int another_variable = 2; // ze spacjami czytelniej

if(some_variable <= 4) some_variable++; // ze spacjami czytelniejszy jest znak mniejsze-równe oraz sama liczba

some( extremely( complicated( set( of( functions(some_variable), another_variable ) ) ) ) );

// ewentualnie:
some(
  extremely(
    complicated(
      set(
        of( functions(some_variable), another variable )
      )
    )
  )
);
                    

function_with_more_arguments(int first_variable, float second_variable) { /* ... */ }
// warto po przecinku po każdym argumencie stawiać spację
```

## Jednoliniowe wyrażenia po pętlach
Często zdarza się, że po naszej pętli `if`, `for`, itp. potrzebujemy wpisać tylko jedno polecenie. Jeśli jest ono krótkie, wpisujemy je w tej samej linii, bez nawiasów klamrowych:
```c
if (i == 0) printf("Hello\n");
```
Jeżeli jest długie, ale nadal jest to jedno polecenie, możemy przejść do następnej linii, zrobić wcięcie, jednak już bez nawiasów klamrowych:
```c
for (int i = 0; i < 5; i++)
  printf("Obecna liczba: %d, następna liczba: %d, jeszcze następna liczba: %d", i, i+1, i+2);
```

**Nie ma jednej i najlepszej szkoły formatowania kodu, jest jednak najgorsza, czyli nieformatowanie kodu wcale. Wtedy wygląda to źle. Nie róbmy tego.**

----------------------------------------
*Made with <3 by Błażej Sewera, (CC-BY-SA 4.0) 2018*
