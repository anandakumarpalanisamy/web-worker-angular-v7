import { TestBed, async } from "@angular/core/testing";
import { AppComponent } from "./app.component";
describe("AppComponent", () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AppComponent],
    }).compileComponents();
  }));
  it("should create the app", async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  it(`should have as title 'web-worker-v7'`, async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual("web-worker-v7");
  }));
  it("should render title in a h1 tag", async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector("h1").textContent).toContain(
      "Welcome to web-worker-v7!",
    );
  }));
  //
  it("should create the app.eventsProcessor", async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.eventsProcessor).toBeTruthy();
  }));
  it("should update its state via the app.eventsProcessor", async(async () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.iteratorTestField).toEqual("foo");
    let p = new Promise(resolve => {
      app.eventsProcessor.tap = resolve;
    });
    app.eventsProcessor.send(42);
    await p;
    expect(app.iteratorTestField).toEqual("bar");
    //
    p = new Promise(resolve => {
      app.eventsProcessor.tap = resolve;
    });
    app.eventsProcessor.send(42);
    await p;
    expect(app.iteratorTestField).toEqual("foo");
    //
    p = new Promise(resolve => {
      app.eventsProcessor.tap = resolve;
    });
    app.eventsProcessor.send(42);
    await p;
    expect(app.iteratorTestField).toEqual("bar");
  }));
});
