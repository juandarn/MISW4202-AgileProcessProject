import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TablaComponent } from './tabla.component';
import { By } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';

describe('TablaComponent', () => {
  let component: TablaComponent;
  let fixture: ComponentFixture<TablaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TablaComponent ],
      imports: [ FormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TablaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
