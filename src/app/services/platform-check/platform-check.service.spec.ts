import { TestBed } from "@angular/core/testing";

import { PlatformCheckService } from "./platform-check.service";

describe("PlatformCheckService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: PlatformCheckService = TestBed.get(PlatformCheckService);
    expect(service).toBeTruthy();
  });
});
